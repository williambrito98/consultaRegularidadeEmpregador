class NaoCadastrado extends Error {
  constructor(error) {
    super(error);
    this.name = "NaoCadastrado";
  }
}

module.exports = NaoCadastrado;
