const NodeID3 = require("node-id3");
// const { join } = require("path");
// const fs = require("fs");
const { ipcRenderer } = require("electron/renderer");
import "./index.css";
let filtered_songs = [];
// handle file upload
document.querySelector("input[type='file']").addEventListener("change", (e) => {
  let files = e.currentTarget.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const tags = NodeID3.read(file.path);
    filtered_songs = [...filtered_songs, file.path];
    const p = document.createElement("p");
    p.textContent = tags.title;
    document.querySelector(".songs").appendChild(p);
    // console.log("Selected file:", tags.title);
  }
});
let imagePath = "";
document.querySelector(".convert").setAttribute("style", "display:none");
document.querySelector(".image-upload").onclick = function () {
  ipcRenderer.send("select-image");
  ipcRenderer.on("image-selected", (e, args) => {
    const image = new Image();
    image.src = `file://${args}`;
    image.width = 200;
    image.height = 200;
    // image.onload = function () {
    //   URL.revokeObjectURL(this.src);
    // };
    if (image.src != "") {
      document.querySelector(".convert").setAttribute("style", "display:block");
      document.querySelector(".cont").appendChild(image);
    }
    // document.querySelector(".image").src = args;
    imagePath = args;
  });
};
document.querySelector(".convert").onclick = async function () {
  // NodeID3.Promise.write()
  for (let index = 0; index < filtered_songs.length; index++) {
    const song = await NodeID3.Promise.read(filtered_songs[index]);
    console.log(song);

    //    edit song cover
    await NodeID3.Promise.update({ APIC: imagePath }, filtered_songs[index]);
    console.log(imagePath);
    // console.log("done editing");
  }
  ipcRenderer.send("done");
  ipcRenderer.on("reset", (e, args) => {
    document.querySelector(".songs").innerHTML = "";
    document.querySelector(".cont").innerHTML = "";
    document.querySelector(".convert").setAttribute("style", "display:none");
    filtered_songs = [];
    imagePath = "";
  });
};
console.log(
  '👋 This message is being logged by "renderer.js", included via Vite'
);
