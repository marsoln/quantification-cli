interface Number {
  fmt: (fractionDigits?: number) => number
}

Number.prototype.fmt = function(fractionDigits = 2) {
  return +this.toFixed(fractionDigits)
}
