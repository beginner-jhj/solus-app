// // Content script to get geolocation
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.command === 'GET_GEOLOCATION') {
//     navigator.geolocation.getCurrentPosition((position) => {
//       chrome.runtime.sendMessage({
//         command: 'SEND_GEOLOCATION',
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//       });
//     });
//   }
// });
