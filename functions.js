function getHostName(url) {
  let hostName;
  if (url.indexOf("://") > -1) {
    hostName = url.split("/")[2];
  } else {
    hostName = url.split("/")[0];
  }
  if (hostName.slice(0, 4) === "www.") {
    hostName = hostName.slice(4);
  }
  return hostName;
}

function getStories() {
  return $.getJSON(
    "https://hack-or-snooze.herokuapp.com/stories?skip=0&limit=10"
  );
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
          <small class="article-author">by ${story.author}</small>
          </li>`);
      $allArticlesList.append($li);
    });
  });
}

function generateFaves($favoritedArticles) {
  $favoritedArticles.empty();
  let $favorites = $("#all-articles-list .favorite");
  let favoritesMessage = "<h5>No favorites added!</h5>";
  for (let i = 0; i < $favorites.length; i++) {
    $favoritedArticles.append($favorites.eq(i).clone());
  }
  if ($favoritedArticles.is(":empty")) {
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
  let $hostNameElements = $("#all-articles-list>li>.article-hostname");
  for (let i = 0; i < $hostNameElements.length; i++) {
    if ($hostNameElements.eq(i).text() === selectedHost) {
      $hostNameElements
        .eq(i)
        .closest("li")
        .clone()
        .appendTo($filteredArticles);
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

function getUser(username) {
  return $.ajax({
    method: "GET",
    url: `https://hack-or-snooze.herokuapp.com/users/${username}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
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
    token = localStorage.getItem("token");
  });
}

function addStory(title, url, author) {
  return $.ajax({
    method: "POST",
    url: "https://hack-or-snooze.herokuapp.com/stories?skip=0&limit=10",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    data: {
      data: {
        username,
        title,
        author,
        url
      }
    }
  });
}

function mustLogin(
  $loginForm,
  $createAccountForm,
  $submitForm,
  $allArticlesList,
  $filteredArticles,
  $favoritedArticles
) {
  $loginForm.slideDown();
  $createAccountForm.slideDown();
  $submitForm.hide();
  $allArticlesList.hide();
  $filteredArticles.hide();
  $favoritedArticles.hide();
  alert("You must login before performing this action");
}
