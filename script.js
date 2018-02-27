var id = 3;

$(function () {
  var $articlesContainer = $('.articles-container');
  var $form = $('form');
  var $allArticlesList = $('#all-articles-list');
  var $nav = $('nav');
  var $navSubmit = $('#nav-submit');
  var $navFavorites = $('#nav-favorites');
  var $navAll = $('#nav-all');
  var $favoritedArticles = $('#favorited-articles');
  var $filteredArticles = $('#filtered-articles');

  $navSubmit.on('click', e => {
    $favoritedArticles.hide();
    $allArticlesList.show();
    $filteredArticles.hide();
    if ($navAll.is(':visible')) {
      $navAll.hide();
      $navFavorites.show();
    }
    if ($form.is(':hidden')) {
      $form.slideDown();
    } else {
      $form.slideUp();
    }
  });

  $nav.on('click', '#nav-favorites, #nav-all', e => {
    $form.hide();
    $filteredArticles.hide();
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

  $form.on('submit', e => {
    e.preventDefault();
    let title = $('#title').val();
    let url = $('#url').val()
    let hostName = getHostName(url);
    id++;
    let $li = $(`<li id="${id}" class="id-${id}">
      <span class="star">
      <i class="far fa-star"></i>
      </span>
      <a class="article-link" href="${url}">
        <strong>${title}</strong>
       </a>
      <small class="article-hostname ${hostName}">(${hostName})</small>
      </li>`);
    $allArticlesList.append($li);
    $form.slideUp('slow');
    $form.trigger('reset');
  });

  $articlesContainer.on('click', '.star', e => {
    let $closestLi = $(e.target).closest('li');
    // let $closestSpan = $(e.target).closest('span');
    let $liID = $closestLi.attr('id');
    if ($closestLi.hasClass('favorite')) {
      removeFromFavorites($liID, $favoritedArticles);
    } else {
      addtoFavorites($liID, $favoritedArticles);
        // $closestSpan.html(`<i class='fas fa-star'></i>`);
        // $closestLi.toggleClass("favorite");
    }
  });

  $articlesContainer.on('click', '.article-hostname', e => {
    let selectedHost = $(e.target).text();
    $form.hide();
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
  let $hostNameElements = $('#all-articles-list>li>small');
  for (let i = 0; i < $hostNameElements.length; i++) {
    if ($hostNameElements.eq(i).text() === selectedHost) {
      $hostNameElements.eq(i).closest('li').clone().appendTo($filteredArticles);
    }
  }
}