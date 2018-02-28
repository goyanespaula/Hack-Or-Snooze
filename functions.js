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
  getStories().then(function (stories) {
    stories.data.forEach(function (storyObject) {
      let url = storyObject.url;
      let hostName = getHostName(url);
      var $li = $(`<li id="${storyObject.storyId}">
          <span class="star">
          <i class="far fa-star"></i>
          </span>
          <a class="article-link" href="${storyObject.url}" target="a_blank">
            <strong>${storyObject.title}</strong>
           </a>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-author">by ${storyObject.author}</small>
          </li>`);
      $allArticlesList.append($li);
    });
  });
}

function generateFaves($favoritedArticles, userObject) {
  $favoritedArticles.empty();
  var favStoryIds = userObject.data.favorites.map(obj => obj.storyId);
  favStoryIds.forEach(function (storyId) {
    $(`#all-articles-list #${storyId}`).clone().appendTo($favoritedArticles)
  })
  let favoritesMessage = "<h5>No favorites added!</h5>";
  if ($favoritedArticles.is(":empty")) {
    $favoritedArticles.append(favoritesMessage);
  }
}

function removeFromAPIFavorites(username, storyId) {
  return $.ajax({
    method: "DELETE",
    url: `https://hack-or-snooze.herokuapp.com/users/${username}/favorites/${storyId}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
}

function removeFromFavorites($liID, $favoritedArticles) {
  let $unfavoritedList = $(`#${$liID}`);
  for (let i = 0; i < $unfavoritedList.length; i++) {
    let $closestSpan = $unfavoritedList.eq(i).find(".star");
    $closestSpan.html('<i class="far fa-star"></i>');
    $unfavoritedList.eq(i).removeClass("favorite");
  }
  generateFaves($favoritedArticles);
}

function addToAPIFavorites(username, storyId) {
  return $.ajax({
    method: "POST",
    url: `https://hack-or-snooze.herokuapp.com/users/${username}/favorites/${storyId}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
}

function addToFavorites($liID) {
  let $unfavoritedList = $(`#${$liID}`);
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
  }).then(function (val) {
    localStorage.setItem("token", val.data.token);
    token = localStorage.getItem("token");
  });
}

function addStory(title, url, author) {
  return $.ajax({
    method: "POST",
    url: "https://hack-or-snooze.herokuapp.com/stories",
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
