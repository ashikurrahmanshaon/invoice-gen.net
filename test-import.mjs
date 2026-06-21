import('jspdf').then(m => {
  console.log("m.jsPDF", typeof m.jsPDF);
  console.log("m.default", typeof m.default);
  if (m.default) {
    console.log("m.default.jsPDF", typeof m.default.jsPDF);
  }
});
