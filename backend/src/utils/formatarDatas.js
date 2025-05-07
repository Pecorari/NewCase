const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const salvarData = (data) => {
  return dayjs(data, "DD/MM/YYYY").format("YYYY-MM-DD"); // para salvar no banco
}
const exibirData = (data) => {
  return dayjs(data).format("DD/MM/YYYY"); // para mostrar no front
}

const exibirDataHora = (datahora) => {
  return dayjs(datahora).tz("America/Sao_Paulo").format('DD/MM/YYYY HH:mm:ss');
};

module.exports = {
  salvarData,
  exibirData,
  exibirDataHora
};
