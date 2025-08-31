const DefaultConfig = {
  currentEngine: "baidu",
  settingsMode: "no",
  isSearchContainerVisible: "yes",
};

// console.log(config.currentEngine);

function classHandler(classselector, operation) {
  switch (operation) {
    case undefined:
      return document.querySelector(classselector);
    case "all":
      return document.querySelectorAll(classselector);
    case "show":
      document.querySelector(classselector).classList.remove("hidden");
      break;
    case "hide":
      document.querySelector(classselector).classList.add("hidden");
      break;
    case "hide-all":
      document.querySelectorAll(classselector).forEach((element) => {
        element.classList.add("hidden");
      });
      break;
    case "show-all":
      document.querySelectorAll(classselector).forEach((element) => {
        element.classList.remove("hidden");
      });
      break;
    case "show-myself-only":
      let me = document.querySelector(classselector);
      Array.from(me.parentNode.children).forEach((element) => {
        if (element !== me) {
          element.classList.add("hidden");
        }
      });
      break;
  }
}

function dbGet(key) {
  let value = null;
  try {
    value = JSON.parse(localStorage.getItem(key));
  } catch (error) {
    console.error("Error getting item from localStorage:", error);
  }
  return value || DefaultConfig[key];
}

function dbSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function getImageNameList() {
  try {
    const dirHandle = await window.showDirectoryPicker();
    const imageNameList = [];

    for await (const entry of dirHandle.values()) {
      if (
        entry.kind === "file" &&
        (entry.name.endsWith(".jpg") ||
          entry.name.endsWith(".jpeg") ||
          entry.name.endsWith(".png") ||
          entry.name.endsWith(".gif"))
      ) {
        imageNameList.push(entry.name);
      }
    }

    return imageNameList;
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("select folder error:", err);
      alert("Cannot access folder, please check browser permission settings.");
    }
  }
}

function randomBackgroundImageSet() {
  let imagePath = dbGet("imagePath") || "";
  let imageNameList = dbGet("imageNameList") || [];
  if (imagePath === "" || imageNameList.length === 0) {
    return null;
  }
  let index = Math.floor(Math.random() * imageNameList.length);
  let path = imagePath + imageNameList[index];
  console.log("current background image:", path);
  try {
    classHandler(`body`).style.backgroundImage = `url('file:///${path}')`;
  } catch (error) {
    console.error("Error setting background image:", error);
    alert("Cannot load background image, please check the path settings.");
  }
}

function settingsModeEnter() {
  dbSet("settingsMode", "yes");
  classHandler(`.confirm-button`, "show");
  classHandler(`.cancel-button`, "show");
  classHandler(`.settings-input`, "show");
  classHandler(`.search-button`, "hide");
  classHandler(`.settings-button`, "hide");
  classHandler(`.shortcut-container`, "hide");
  classHandler(`.search-input`, "hide");
  classHandler(`.engine-container`, "hide");
  classHandler(`.input-container`).style.marginLeft = "60px";
  classHandler(`.settings-input`).placeholder =
    dbGet("imagePath") ||
    "Enter image folder path (e.g. F:/path/images), then confirm in the pop-up window.";
  classHandler(`.button-list`).classList.add("expanded");
}

function settingsModeExit() {
  dbSet("settingsMode", "no");
  classHandler(`.confirm-button`, "hide");
  classHandler(`.cancel-button`, "hide");
  classHandler(`.settings-input`, "hide");
  classHandler(`.search-button`, "show");
  classHandler(`.settings-button`, "show");
  classHandler(`.shortcut-container`, "show");
  classHandler(`.search-input`, "show");
  classHandler(`.engine-container`, "show");
  classHandler(`.input-container`).style.marginLeft = "12px";
  classHandler(`.button-list`).classList.remove("expanded");
}

// 将当前选中的引擎设置为第一个子元素
function setSelectedChildToFirstChild(selector) {
  const element = classHandler(selector);
  if (element && element.parentNode) {
    const parent = element.parentNode;
    parent.insertBefore(element, parent.firstChild);
  }
}

function initialize() {
  // 禁用右键默认样式
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  // random bg image
  randomBackgroundImageSet();
  // init engine list
  const currentEngine = dbGet("currentEngine");
  classHandler(`.engine-item[name="${currentEngine}"]`, "show-myself-only");
  setSelectedChildToFirstChild(`.engine-item[name="${currentEngine}"]`);

  // init input container
  classHandler(`.settings-input`, "hide");
  // init button list
  classHandler(`.search-button`, "show-myself-only");
  // settings mode
  if (dbGet("settingsMode") === "yes") {
    settingsModeEnter();
  }
  // 初始化完成后, 显示搜索框, 防止样式错乱
  classHandler(".search-container").style.visibility = "visible";

  if (dbGet("isSearchContainerVisible") === "no") {
    classHandler(`.search-container`, "hide");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

classHandler(`.engine-item`, "all").forEach((element) => {
  element.addEventListener("mouseenter", (event) => {
    classHandler(`.engine-item`, "show-all");
    classHandler(`.engine-list`).classList.add("expanded");
  });
});

classHandler(".engine-list").addEventListener("mouseleave", (event) => {
  const currentEngine = dbGet("currentEngine");
  classHandler(`.engine-list`).classList.remove("expanded");
  classHandler(`.engine-item[name="${currentEngine}"]`, "show-myself-only");
});

classHandler(".engine-item", "all").forEach((element) => {
  element.addEventListener("click", (event) => {
    const engineName = event.currentTarget.getAttribute("name");
    dbSet("currentEngine", engineName);
    classHandler(`.engine-item[name="${engineName}"]`, "show-myself-only");
    setSelectedChildToFirstChild(`.engine-item[name="${engineName}"]`);
  });
});

classHandler(`.search-button`).addEventListener("mouseenter", (event) => {
  classHandler(`.settings-button`, "show");
  // classHandler(`.button-list`).style.backgroundColor = "lightgray";
  classHandler(`.button-list`).classList.add("expanded");
  // console.log(classHandler(`.button-list`).offsetWidth);
});

classHandler(".button-list").addEventListener("mouseleave", (event) => {
  if (dbGet("settingsMode") === "no") {
    // classHandler(`.button-list`).style.backgroundColor = "transparent";
    classHandler(`.button-list`).classList.remove("expanded");
    classHandler(`.search-button`, "show-myself-only");
  }
});

classHandler(".engine-item", "all").forEach((element) => {
  element.addEventListener("click", (event) => {
    const engineName = event.currentTarget.getAttribute("name");
    dbSet("currentEngine", engineName);
    classHandler(`.engine-item[name="${engineName}"]`, "show-myself-only");
  });
});

classHandler(`.settings-button`).addEventListener("click", (event) => {
  settingsModeEnter();
});

classHandler(`.cancel-button`).addEventListener("click", (event) => {
  settingsModeExit();
});

classHandler(`.confirm-button`).addEventListener("click", (event) => {
  let imagePath = classHandler(`.settings-input`).value;
  imagePath = imagePath.trim();
  if (imagePath === "") {
    alert(
      "Enter image folder path (e.g. F:/path/images), then confirm in the pop-up window."
    );
    return;
  }

  imagePath = imagePath.replace(/\\/g, "/");
  if (!imagePath.endsWith("/")) {
    imagePath += "/";
  }

  getImageNameList().then((imageNameList) => {
    if (!imageNameList || imageNameList.length === 0) {
      alert("the folder is empty or contains no images.");
      imagePath = "";
      imageNameList = [];
      return;
    }
    dbSet("imagePath", imagePath);
    dbSet("imageNameList", imageNameList || []);
    randomBackgroundImageSet();
  });
  settingsModeExit();
});

function performSearch() {
  const query = classHandler(".search-input").value;
  if (query.trim() === "") {
    return;
  }

  const currentEngineName = dbGet("currentEngine");
  const engineElement = classHandler(
    `.engine-item[name="${currentEngineName}"]`
  );
  const searchUrlTemplate = engineElement.getAttribute("value");

  const searchUrl = searchUrlTemplate.replace(
    "{query}",
    encodeURIComponent(query)
  );
  if (searchUrl) {
    window.open(searchUrl, "_blank");
  }
}

classHandler(".search-button").addEventListener("click", performSearch);

classHandler(".shortcut-item", "all").forEach((element) => {
  element.addEventListener("click", (event) => {
    const url = event.currentTarget.getAttribute("value");
    if (url) {
      window.open(url, "_blank");
    }
  });
});

function showSearchContainer() {
  dbSet("isSearchContainerVisible", "yes");
  classHandler(".search-input").value = "";
  classHandler(`.search-container`, "show");
  classHandler(`.search-container`).classList.remove("fade-out-up");
  classHandler(`.search-container`).classList.add("fade-in-down");
}

function hideSearchContainer() {
  dbSet("isSearchContainerVisible", "no");
  classHandler(`.search-container`).classList.remove("fade-in-down");
  classHandler(`.search-container`).classList.add("fade-out-up");
}

document.addEventListener("keydown", (event) => {
  let input = null;
  if (dbGet("settingsMode") === "yes") {
    input = classHandler(".settings-input");
  } else {
    input = classHandler(".search-input");
  }

  if (event.key === "Escape" && input.value.trim() === "") {
    hideSearchContainer();
    return;
  }

  if (dbGet("isSearchContainerVisible") === "no") {
    showSearchContainer();
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      // 在 showSearchContainer 动画结束后再聚焦, 这里先赋值
      input.value = event.key;
    }
  }

  if (event.key === "Enter") {
    if (dbGet("settingsMode") === "yes") {
      // 在设置模式下，按下回车键时确认设置
      classHandler(`.confirm-button`).click();
    } else {
      performSearch();
    }
  }
  // fixme: 不写此行, 用ctrl + a 触发窗口显示时, 会复制placeholder. ╮(╯▽╰)╭
  input.focus();
  // 延迟聚焦, 确保动画完成后再聚焦, 否则虽不影响使用, 但是字符后边没有光标闪烁
  setTimeout(() => {
    input.focus();
  }, 600);
});
