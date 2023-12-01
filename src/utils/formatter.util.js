const upperCammelCase = (string) => {
  return string.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
    return g1.toUpperCase() + g2.toLowerCase();
  });
};

module.exports = {
  upperCammelCase,
};
