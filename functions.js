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

function generateTenStories($allArticlesList) {
  getStories().then(function(stories) {
    $allArticlesList.empty();
    stories.data.forEach(function(storyObject) {
      let url = storyObject.url;
      let hostName = getHostName(url);
      let starType = isFavorite(storyObject) ? "fas" : "far";
      let favoriteClass = isFavorite(storyObject) ? "favorite" : "";
      var $li = $(`<li id="${storyObject.storyId}" class="${favoriteClass} id-${
        storyObject.storyId
      }">
          <span class="star">
          <i class="${starType} fa-star"></i>
          </span>
          <a class="article-link" href="${storyObject.url}" target="a_blank">
            <strong>${storyObject.title}</strong>
           </a>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-author">by ${storyObject.author}</small>
          </li>`);
      $allArticlesList.append($li);
    });
    $allArticlesList.show();
  });
}

function isFavorite(storyObject) {
  let favStoryIds;
  if (userObject) {
    favStoryIds = userObject.data.favorites.map(obj => obj.storyId);
  } else {
    favStoryIds = [];
  }
  return favStoryIds.includes(storyObject.storyId);
}

function removeFromAPIFavorites(username, storyId) {
  return $.ajax({
    method: "DELETE",
    url: `https://hack-or-snooze.herokuapp.com/users/${username}/favorites/${storyId}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
}

function removeFromDOMFavorites(storyId, $favoritedArticles) {
  let $unfavoritedList = $(`.id-${storyId}`);
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
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
}

function addToDOMFavorites(storyId) {
  let $unfavoritedList = $(`.id-${storyId}`);
  for (let i = 0; i < $unfavoritedList.length; i++) {
    let $closestSpan = $unfavoritedList.eq(i).find(".star");
    $closestSpan.html('<i class="fas fa-star"></i>');
    $unfavoritedList.eq(i).addClass("favorite");
  }
}

function generateFaves($favoritedArticles) {
  $favoritedArticles.empty();
  let favoritesMessage = "<h5>No favorites added!</h5>";
  userObject.data.favorites.forEach(storyObject => {
    let url = storyObject.url;
    let hostName = getHostName(url);
    let starType = "fas";
    let favoriteClass = "favorite";
    var $li = $(`<li id="${storyObject.storyId}" class="${favoriteClass} id-${
      storyObject.storyId
    }">
          <span class="star">
          <i class="${starType} fa-star"></i>
          </span>
          <a class="article-link" href="${storyObject.url}" target="a_blank">
            <strong>${storyObject.title}</strong>
           </a>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-author">by ${storyObject.author}</small>
          </li>`);
    $favoritedArticles.append($li);
  });
  // let favStoryIds = userObject.data.favorites.map(obj => obj.storyId);
  // favStoryIds.forEach(function(storyId) {
  //   $(`#all-articles-list .id-${storyId}`)
  //     .clone()
  //     .appendTo($favoritedArticles);
  // });
  if ($favoritedArticles.is(":empty")) {
    $favoritedArticles.append(favoritesMessage);
  }
}

function generateMyStories($myArticles) {
  let storiesArr = userObject.data.stories;
  let message = "<h5>No stories added by user yet!</h5>";
  $myArticles.empty();
  storiesArr.forEach(function(storyObj) {
    let url = storyObj.url;
    let hostName = getHostName(url);
    let author = storyObj.author;
    let title = storyObj.title;
    let favoriteClass = isFavorite(storyObj) ? "favorite" : "";
    var $li = $(`<li id="${storyObj.storyId}" class="${favoriteClass} id-${
      storyObj.storyId
    }">
          <span class="trash-can">
           <i class="fas fa-trash-alt"></i>
          </span>
          <span class="pencil">
           <i class="fas fa-pencil-alt"></i>
          </span>
          <a class="article-link" href="${url}" target="a_blank">
            <strong>${title}</strong>
           </a>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-author">by ${author}</small>
          </li>`);
    $myArticles.append($li);
  });
  if ($myArticles.is(":empty")) {
    $myArticles.append(message);
  }
  $myArticles.show();
}

// refactor to use the API
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
    payload = token.split(".")[1] || undefined;
    parsedPayload = JSON.parse(atob(payload));
    globalUsername = parsedPayload.username;
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
        username: globalUsername,
        title,
        author,
        url
      }
    }
  });
}

function deleteStory(storyId) {
  return $.ajax({
    method: "DELETE",
    url: `https://hack-or-snooze.herokuapp.com/stories/${storyId}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
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
  alert("You must login to perform this action");
}
