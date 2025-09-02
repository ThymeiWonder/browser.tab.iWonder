/**
 * @file tab.js
 * @description This file contains the JavaScript code for the browser's start page.
 * @version 1.0.0
 * @date 2025-09-01
 */

// Default configuration for the application
const DefaultConfig = {
  currentEngine: "baidu", // Default search engine
  settingsMode: "no", // 'yes' if in settings mode, 'no' otherwise
  isSearchContainerVisible: "yes", // 'yes' if the search container is visible, 'no' otherwise
};

// console.log(config.currentEngine);

/**
 * A utility function to handle DOM element selection and class manipulation.
 * @param {string} classselector - The CSS selector for the element(s).
 * @param {string} [operation] - The operation to perform. Can be 'all', 'show', 'hide', 'hide-all', 'show-all', 'show-myself-only'.
 * @returns {Element|NodeList|undefined} A single element, a list of elements, or undefined if an operation is performed.
 */
function classHandler(classselector, operation) {
  switch (operation) {
    case undefined:
      // Return the first element matching the selector
      return document.querySelector(classselector);
    case "all":
      // Return all elements matching the selector
      return document.querySelectorAll(classselector);
    case "show":
      // Show a single element by removing the 'hidden' class
      document.querySelector(classselector).classList.remove("hidden");
      break;
    case "hide":
      // Hide a single element by adding the 'hidden' class
      document.querySelector(classselector).classList.add("hidden");
      break;
    case "hide-all":
      // Hide all elements matching the selector
      document.querySelectorAll(classselector).forEach((element) => {
        element.classList.add("hidden");
      });
      break;
    case "show-all":
      // Show all elements matching the selector
      document.querySelectorAll(classselector).forEach((element) => {
        element.classList.remove("hidden");
      });
      break;
    case "show-myself-only":
      // Hide all sibling elements of the selected element
      let me = document.querySelector(classselector);
      Array.from(me.parentNode.children).forEach((element) => {
        if (element !== me) {
          element.classList.add("hidden");
        }
      });
      break;
  }
}

/**
 * Retrieves an item from localStorage and parses it as JSON.
 * If the item doesn't exist or there's an error, it returns a default value from DefaultConfig.
 * @param {string} key - The key of the item to retrieve.
 * @returns {any} The retrieved value or the default value.
 */
function dbGet(key) {
  let value = null;
  try {
    // Attempt to get and parse the item from localStorage
    value = JSON.parse(localStorage.getItem(key));
  } catch (error) {
    console.error("Error getting item from localStorage:", error);
  }
  // Return the value or the default value if value is null/undefined
  return value || DefaultConfig[key];
}

/**
 * Stores a value in localStorage after stringifying it.
 * @param {string} key - The key under which to store the value.
 * @param {any} value - The value to store.
 */
function dbSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Opens a directory picker and returns a list of image file names.
 * @returns {Promise<string[]|undefined>} A promise that resolves to a list of image names, or undefined if the user cancels.
 */
async function getImageNameList() {
  try {
    // Show the directory picker to the user
    const dirHandle = await window.showDirectoryPicker();
    const imageNameList = [];

    // Iterate over the files in the selected directory
    for await (const entry of dirHandle.values()) {
      // Check if the entry is a file and has a valid image extension
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
    // Handle cases where the user aborts the selection
    if (err.name !== "AbortError") {
      console.error("select folder error:", err);
      alert("Cannot access folder, please check browser permission settings.");
    }
  }
}

/**
 * Sets a random background image from the user-selected folder.
 */
function randomBackgroundImageSet() {
  let imagePath = dbGet("imagePath") || "";
  let imageNameList = dbGet("imageNameList") || [];
  // If no image path or list is set, do nothing
  if (imagePath === "" || imageNameList.length === 0) {
    return null;
  }
  // Select a random image from the list
  let index = Math.floor(Math.random() * imageNameList.length);
  let path = imagePath + imageNameList[index];
  console.log("current background image:", path);
  try {
    // Set the background image of the body
    classHandler(`body`).style.backgroundImage = `url('file:///${path}')`;
  } catch (error) {
    console.error("Error setting background image:", error);
    alert("Cannot load background image, please check the path settings.");
  }
}

/**
 * Enters settings mode, showing and hiding relevant UI elements.
 */
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
  // Set placeholder text for the settings input
  classHandler(`.settings-input`).placeholder =
    dbGet("imagePath") ||
    "Enter image folder path (e.g. F:/path/images), then confirm in the pop-up window.";
  classHandler(`.button-list`).classList.add("expanded");
}

/**
 * Exits settings mode, restoring the default UI state.
 */
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

/**
 * Moves the selected element to be the first child of its parent.
 * @param {string} selector - The CSS selector for the element to move.
 */
function setSelectedChildToFirstChild(selector) {
  const element = classHandler(selector);
  if (element && element.parentNode) {
    const parent = element.parentNode;
    // Move the element to the top of the list
    parent.insertBefore(element, parent.firstChild);
  }
}

/**
 * Initializes the application on page load.
 */
function initialize() {
  // Set a random background image
  randomBackgroundImageSet();
  // Initialize the search engine list
  const currentEngine = dbGet("currentEngine");
  classHandler(`.engine-item[name="${currentEngine}"]`, "show-myself-only");
  setSelectedChildToFirstChild(`.engine-item[name="${currentEngine}"]`);

  // Initialize the input container state
  classHandler(`.settings-input`, "hide");
  // Initialize the button list state
  classHandler(`.search-button`, "show-myself-only");
  // Check if settings mode should be enabled
  if (dbGet("settingsMode") === "yes") {
    settingsModeEnter();
  }
  // Make the search container visible after initialization to prevent style issues
  classHandler(".search-container").style.visibility = "visible";

  // Hide the search container if it was previously hidden
  if (dbGet("isSearchContainerVisible") === "no") {
    classHandler(`.search-container`, "hide");
  }
}

// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

// --- Event Listeners for UI Interactions ---

// Right-click to show/hide the search container
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const isVisible = dbGet("isSearchContainerVisible") === "yes";
  const searchContainer = classHandler(".search-container");

  if (isVisible) {
    const query = classHandler(".search-input").value;
    // Hide only if the click is outside the search container and the input is empty
    if (query.trim() === "" && !searchContainer.contains(event.target)) {
      hideSearchContainer();
    }
  } else {
    // If not visible, show it on any right-click
    showSearchContainer();
  }
});

// Left-click on empty space to show the search container
document.addEventListener("click", (event) => {
  if (event.target === document.body) {
    const isVisible = dbGet("isSearchContainerVisible") === "yes";
    if (!isVisible) {
      showSearchContainer();
    }
  }
});

// Middle-click on the search container to hide it
classHandler(".search-container").addEventListener("mousedown", (event) => {
  if (event.button === 1) {
    // Middle mouse button
    const query = classHandler(".search-input").value;
    if (query.trim() === "") {
      hideSearchContainer();
    }
  }
});

// Show all search engines on mouse enter
classHandler(`.engine-item`, "all").forEach((element) => {
  element.addEventListener("mouseenter", (event) => {
    // 调整样式: 当鼠标悬停300ms后, 再显示扩展按钮.
    setTimeout(() => {
      if (!classHandler(`.engine-item`).matches(":hover")) {
        return;
      }
      classHandler(`.engine-item`, "show-all");
      classHandler(`.engine-list`).classList.add("expanded");
    }, 300);
  });
});

// Collapse the search engine list on mouse leave
classHandler(".engine-list").addEventListener("mouseleave", (event) => {
  const currentEngine = dbGet("currentEngine");
  classHandler(`.engine-list`).classList.remove("expanded");
  // Only show the currently selected engine
  classHandler(`.engine-item[name="${currentEngine}"]`, "show-myself-only");
});

// Handle search engine selection
classHandler(".engine-item", "all").forEach((element) => {
  element.addEventListener("click", (event) => {
    const engineName = event.currentTarget.getAttribute("name");
    dbSet("currentEngine", engineName);
    // Show only the selected engine
    classHandler(`.engine-item[name="${engineName}"]`, "show-myself-only");
    // Move the selected engine to the top of the list
    setSelectedChildToFirstChild(`.engine-item[name="${engineName}"]`);
  });
});

// Show the settings button on mouse enter over the search button
classHandler(`.search-button`).addEventListener("mouseenter", (event) => {
  // 调整样式: 当鼠标悬停300ms后, 再显示扩展按钮.
  setTimeout(() => {
    if (!classHandler(`.search-button`).matches(":hover")) {
      return;
    }
    classHandler(`.settings-button`, "show");
    classHandler(`.button-list`).classList.add("expanded");
  }, 300);
});

// Collapse the button list on mouse leave
classHandler(".button-list").addEventListener("mouseleave", (event) => {
  if (dbGet("settingsMode") === "no") {
    // classHandler(`.button-list`).style.backgroundColor = "transparent";
    classHandler(`.button-list`).classList.remove("expanded");
    // Only show the search button
    classHandler(`.search-button`, "show-myself-only");
  }
});



// Enter settings mode when the settings button is clicked
classHandler(`.settings-button`).addEventListener("click", (event) => {
  settingsModeEnter();
});

// Exit settings mode when the cancel button is clicked
classHandler(`.cancel-button`).addEventListener("click", (event) => {
  settingsModeExit();
});

// Confirm settings and set background image path
classHandler(`.confirm-button`).addEventListener("click", (event) => {
  let imagePath = classHandler(`.settings-input`).value;
  imagePath = imagePath.trim();
  if (imagePath === "") {
    alert(
      "Enter image folder path (e.g. F:/path/images), then confirm in the pop-up window."
    );
    return;
  }

  // Normalize the path
  imagePath = imagePath.replace(/\\/g, "/");
  if (!imagePath.endsWith("/")) {
    imagePath += "/";
  }

  // Get the list of images from the selected directory
  getImageNameList().then((imageNameList) => {
    if (!imageNameList || imageNameList.length === 0) {
      alert("the folder is empty or contains no images.");
      imagePath = "";
      imageNameList = [];
      return;
    }
    // Save the path and image list to localStorage
    dbSet("imagePath", imagePath);
    dbSet("imageNameList", imageNameList || []);
    // Set a new random background image
    randomBackgroundImageSet();
  });
  settingsModeExit();
});

/**
 * Performs a search using the selected search engine.
 */
function performSearch() {
  const query = classHandler(".search-input").value;
  if (query.trim() === "") {
    return; // Do nothing if the query is empty
  }

  const currentEngineName = dbGet("currentEngine");
  const engineElement = classHandler(
    `.engine-item[name="${currentEngineName}"]`
  );
  const searchUrlTemplate = engineElement.getAttribute("value");

  // Construct the search URL
  const searchUrl = searchUrlTemplate.replace(
    "{query}",
    encodeURIComponent(query)
  );
  // Open the search results in a new tab
  if (searchUrl) {
    window.open(searchUrl, "_blank");
  }
}

// Perform search when the search button is clicked
classHandler(".search-button").addEventListener("click", performSearch);

// Handle shortcut item clicks
classHandler(".shortcut-item", "all").forEach((element) => {
  element.addEventListener("click", (event) => {
    const url = event.currentTarget.getAttribute("value");
    if (url) {
      // Open the shortcut URL in a new tab
      window.open(url, "_blank");
    }
  });
});

/**
 * Shows the search container with an animation.
 */
function showSearchContainer() {
  dbSet("isSearchContainerVisible", "yes");
  classHandler(".search-input").value = "";
  classHandler(`.search-container`, "show");
  classHandler(`.search-container`).classList.remove("fade-out-up");
  classHandler(`.search-container`).classList.add("fade-in-down");
}

/**
 * Hides the search container with an animation.
 */
function hideSearchContainer() {
  dbSet("isSearchContainerVisible", "no");
  classHandler(`.search-container`).classList.remove("fade-in-down");
  classHandler(`.search-container`).classList.add("fade-out-up");
}

// --- Global Keydown Event Listener ---
document.addEventListener("keydown", (event) => {
  // Show search container on any key press (except when it's already visible)
  if (dbGet("isSearchContainerVisible") === "no") {
    // But not for the Escape key
    if (event.key === "Escape") {
      return;
    }
    showSearchContainer();
    // If a printable character is typed, put it in the input field
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      // Set the input value directly
      if (dbGet("settingsMode") === "yes") {
        classHandler(".settings-input").value = event.key;
      } else {
        classHandler(".search-input").value = event.key;
      }
    }
  }

  let input =
    dbGet("settingsMode") === "yes"
      ? classHandler(".settings-input")
      : classHandler(".search-input");

  // Hide the search container on 'Escape' if the input is empty
  if (event.key === "Escape" && input.value.trim() === "") {
    hideSearchContainer();
    return;
  }

  // Handle 'Enter' key press
  if (event.key === "Enter") {
    if (dbGet("settingsMode") === "yes") {
      // In settings mode, 'Enter' confirms the settings
      classHandler(`.confirm-button`).click();
    } else {
      // In normal mode, 'Enter' performs a search
      performSearch();
    }
  }
  // fixme: 不写此行, 用ctrl + a  然后按刷新按钮 触发窗口显示时, 会复制placeholder. ╮(╯▽╰)╭
  // Focus the input to ensure the cursor is visible.
  input.focus();
  // 延迟聚焦, 确保动画完成后再聚焦, 否则虽不影响使用, 但是字符后边没有光标闪烁
  // 实际测试 延迟时间并不重要. 只要有延迟时间, 光标就可以显示.
  // Delay focus to ensure it happens after the animation completes.
  setTimeout(() => {
    input.focus();
  }, 100);
});
