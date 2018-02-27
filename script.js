var id = 3;

$(function() {
  var $navLogin = $('#nav-login');
  var $loginForm = $('#login-form');
  var $createAccountForm = $('#create-account-form');
  var $articlesContainer = $('.articles-container');
  var $submitForm = $('#submit-form');
  var $allArticlesList = $('#all-articles-list');
  var $nav = $('nav');
  var $navSubmit = $('#nav-submit');
  var $navFavorites = $('#nav-favorites');
  var $navAll = $('#nav-all');
  var $favoritedArticles = $('#favorited-articles');
  var $filteredArticles = $('#filtered-articles');

  firstTenStories($allArticlesList);

  $createAccountForm.on('submit', e=> {
    e.preventDefault();
    var name = $('#create-account-name').val();
    var username = $('#create-account-username').val();
    var password = $('#create-account-password').val();
    createUser(name, username, password).then(function() {
      getToken(username, password);
    });
    $createAccountForm.trigger("reset");
  });

  $navLogin.on('click', e=> {
    $loginForm.slideDown();
    $createAccountForm.slideDown();
    $submitForm.hide();
    $allArticlesList.hide();
    $filteredArticles.hide();
    $favoritedArticles.hide();
  });  

  $navSubmit.on('click', e => {
    $favoritedArticles.hide();
    $allArticlesList.show();
    $filteredArticles.hide();
    $loginForm.hide();
    $createAccountForm.hide();
    if ($navAll.is(':visible')) {
      $navAll.hide();
      $navFavorites.show();
    }
    $submitForm.slideToggle();
  });

  $nav.on('click', '#nav-favorites, #nav-all', e => {
    $submitForm.hide();
    $filteredArticles.hide();
    $loginForm.hide();
    $createAccountForm.hide();
    if ($navFavorites.is(':visible')) {
      $navFavorites.hide();
      $navAll.show();
      $allArticlesList.hide();
      generateFaves($favoritedArticles);
      $favoritedArticles.show();
    } else {
      $navFavorites.show();
      $navAll.hide();
      $favoritedArticles.hide();
      $allArticlesList.show();
    }
  });

  $submitForm.on('submit', e => {
    e.preventDefault();
    let title = $('#title').val();
    let url = $('#url').val()
    let hostName = getHostName(url);
    let author = $('#author').val();
    id++;
    let $li = $(`<li id="${id}" class="id-${id}">
      <span class="star">
      <i class="far fa-star"></i>
      </span>
      <a class="article-link" href="${url}" target="a_blank">
        <strong>${title}</strong>
       </a>
      <small class="article-hostname ${hostName}">(${hostName})</small>
      <small class="author">by ${author}</small>
      </li>`);
    $allArticlesList.append($li);
    $submitForm.slideUp('slow');
    $submitForm.trigger('reset');
  });

  $articlesContainer.on('click', '.star', e => {
    let $closestLi = $(e.target).closest('li');
    let $liID = $closestLi.attr('id');
    if ($closestLi.hasClass('favorite')) {
      removeFromFavorites($liID, $favoritedArticles);
    } else {
      addtoFavorites($liID, $favoritedArticles);
    }
  });

  $articlesContainer.on('click', '.article-hostname', e => {
    let selectedHost = $(e.target).text();
    $submitForm.hide();
    $allArticlesList.hide();
    $favoritedArticles.hide();
    $navFavorites.hide();
    $navAll.show();
    generateFiltered(selectedHost, $filteredArticles);
    $filteredArticles.show();
  });
});

function getHostName(url) {
  let hostName;
  if (url.indexOf("://") > -1) {
    hostName = url.split("/")[2];
  } else {
    hostName = url.split("/")[0];
  }
  if (hostName.slice(0,4) === 'www.') {
    hostName = hostName.slice(4);
  }
  return hostName;
}

function getStories() {
  return $.getJSON("https://hack-or-snooze.herokuapp.com/stories?skip=0&limit=10");
}

function firstTenStories($allArticlesList) {
  getStories().then(function(stories) {
    stories.data.forEach(function(story) {
      id++;
      let url = story.url;
      let hostName = getHostName(url);
      var $li = $(`<li id="${id}" class="id-${id}">
          <span class="star">
          <i class="far fa-star"></i>
          </span>
          <a class="article-link" href="${story.url}" target="a_blank">
            <strong>${story.title}</strong>
           </a>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="author">by ${story.author}</small>
          </li>`);
      $allArticlesList.append($li);
    });
  });
}

function generateFaves($favoritedArticles) {
  $favoritedArticles.empty();
  let $favorites = $('#all-articles-list .favorite');
  let favoritesMessage = '<h5>No favorites added!</h5>'
  for (let i = 0; i < $favorites.length; i++) {
    $favoritedArticles.append($favorites.eq(i).clone());
  }
  if ($favoritedArticles.is(':empty')) {
    $favoritedArticles.append(favoritesMessage);
  }
}

function removeFromFavorites($liID, $favoritedArticles) {
  let $unfavoritedList = $(`.id-${$liID}`);
  for (let i = 0; i < $unfavoritedList.length; i++) {
    let $closestSpan = $unfavoritedList.eq(i).find(".star");
    $closestSpan.html('<i class="far fa-star"></i>');
    $unfavoritedList.eq(i).removeClass("favorite");
  }
  generateFaves($favoritedArticles);
}

function addtoFavorites($liID) {
  let $unfavoritedList = $(`.id-${$liID}`);
  for (let i = 0; i < $unfavoritedList.length; i++) {
    let $closestSpan = $unfavoritedList.eq(i).find(".star");
    $closestSpan.html('<i class="fas fa-star"></i>');
    $unfavoritedList.eq(i).addClass("favorite");
  }
}

function generateFiltered(selectedHost, $filteredArticles) {
  $filteredArticles.empty();
  let $hostNameElements = $('#all-articles-list>li>.article-hostname');
  for (let i = 0; i < $hostNameElements.length; i++) {
    if ($hostNameElements.eq(i).text() === selectedHost) {
      $hostNameElements.eq(i).closest('li').clone().appendTo($filteredArticles);
    }
  }
}


function createUser(name, username, password) {
  return $.ajax({
    method: "POST",
    url: "https://hack-or-snooze.herokuapp.com/users",
    data: {
      data: {
        name: name,
        username: username,
        password: password
      }
    }
  });
}

function getToken(username, password) {
  return $.ajax({
    method: "POST",
    url: "https://hack-or-snooze.herokuapp.com/auth",
    data: {
      data: {
        username: username,
        password: password
      }
    }
  }).then(function(val) {
    localStorage.setItem("token", val.data.token);
  });
}

function checkUser() {
  $.ajax({
    method: "GET",
    url: "https://hack-or-snooze.herokuapp.com/users/bobbyface3",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }).then(function(val) {
  });
}