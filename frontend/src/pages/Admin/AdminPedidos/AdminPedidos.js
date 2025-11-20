import React, { useEffect, useState } from "react";
import api from "../../../hooks/useApi";
import "./AdminPedidos.css";

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ searchValue: "" });
  const [loadingEtiqueta, setLoadingEtiqueta] = useState(false);

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    try {
      const response = await api.get("/pedidosAdmin");
      setPedidos(response.data);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro inesperado");
      console.error("Erro ao buscar pedidos:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.searchValue.trim() === "") {
      buscarPedidos();
      return;
    }

    try {
      const response = await api.get(`/pedidosAdmin/search/${form.searchValue}`);
      console.log(response.data)
      setPedidos(response.data);
      setForm({ searchValue: "" });
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro inesperado");
      console.error("Erro ao buscar pedidos:", err);
    }
  };

  async function gerarEtiqueta(id) {
    try {
      setLoadingEtiqueta(true);
      const response = await api.post(`/frete/${id}/gerar-etiqueta`);

      const { message, etiqueta_url } = response.data;

      console.log(message);
      console.log("URL da etiqueta:", etiqueta_url);

      setPedidoSelecionado((prev) => ({ ...prev, etiqueta_url }));
      setPedidos((prev) => prev.map((p) => p.pedido_id === id ? { ...p, etiqueta_url } : p));
    } catch (error) {
      console.error("Erro ao gerar etiqueta:", error.response?.data || error);
      alert("Falha ao gerar etiqueta!");
    } finally {
      setLoadingEtiqueta(false);
    }
  }

  return (
    <div className="admin-container">
      {erro && <span className="erro">{erro}</span>}

      <h2 className="title-admin-pedido">Buscar Pedido</h2>
      <form className="form-admin-pedido" onSubmit={handleSubmit}>
        <input
          className="input-admin-pedido"
          type="text"
          name="searchValue"
          placeholder="ID / Nome do usuario"
          value={form.searchValue}
          onChange={handleInputChange}
        />
        <button className="form-btn-admin-pedido" type="submit">Buscar</button>
      </form>


      <br/><br/><hr/><br/><br/> 


      <h2 className="title-admin-pedido">Lista de pedidos</h2>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <div className="pedido-grid">
          <div className="pedido-header">
            <span>ID</span>
            <span>Cliente</span>
            <span>Total</span>
            <span>Status</span>
            <span>Criado em</span>
          </div>

          {pedidos.map((pedido) => (
            <div className="pedido-row" key={pedido.pedido_id} onClick={() => setPedidoSelecionado(pedido)}>
              <span data-label="ID">{pedido.pedido_id}</span>
              <span data-label="Cliente">{pedido.usuario.nome}</span>
              <span data-label="Total">R$ {pedido.total}</span>
              <span data-label="Status">{pedido.status}</span>
              <span data-label="Criado em">{new Date(pedido.criado_em).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {pedidoSelecionado && (
        <div className="modal-adm">
          <div className="modal-content-adm">
            <button className="close-modal-adminPedidos" onClick={() => setPedidoSelecionado(null)}>X</button>
            <h2>Detalhes do Pedido #{pedidoSelecionado.pedido_id}</h2>

            <div className="modal-grid-adm">
              <div>
                <section>
                  <h3 className="subtitles-sections-adm">Informações Gerais</h3>
                  <p>Status: {pedidoSelecionado.status}</p>
                  <p>Data do Pedido: {new Date(pedidoSelecionado.criado_em).toLocaleString()}</p>
                  <p>Total: R$ {pedidoSelecionado.total}</p>
                </section>

                <section>
                  <h3 className="subtitles-sections-adm">Endereço a ser entregue</h3>
                  <p>Rua: {pedidoSelecionado.endereco.endereco_rua}</p>
                  <p>Número: {pedidoSelecionado.endereco.endereco_numero}</p>
                  <p>Bairro: {pedidoSelecionado.endereco.endereco_bairro}</p>
                  <p>Cidade: {pedidoSelecionado.endereco.endereco_cidade}</p>
                  <p>Estado: {pedidoSelecionado.endereco.endereco_estado}</p>
                  <p>CEP: {pedidoSelecionado.endereco.endereco_cep}</p>
                  <p>Complemento: {pedidoSelecionado.endereco.endereco_complemento ? pedidoSelecionado.endereco.endereco_complemento : 'S/N'}</p>
                </section>

                <section>
                  <h3 className="subtitles-sections-adm">Destinatario</h3>
                  <p>Nome: {pedidoSelecionado.destinatario.nome}</p>
                  <p>CPF: {pedidoSelecionado.destinatario.cpf}</p>
                  <p>Email: {pedidoSelecionado.destinatario.email}</p>
                  <p>Telefone: {pedidoSelecionado.destinatario.telefone}</p>
                </section>
              </div>

              <div>
                <section>
                  <h3 className="subtitles-sections-adm">Usuario</h3>
                  <p>Nome: {pedidoSelecionado.usuario.nome}</p>
                  <p>CPF: {pedidoSelecionado.usuario.cpf}</p>
                  <p>Email: {pedidoSelecionado.usuario.email}</p>
                  <p>Telefone: {pedidoSelecionado.usuario.telefone}</p>
                </section>

                <section>
                  <h3 className="subtitles-sections-adm">Pagamento</h3>
                  {pedidoSelecionado.pagamento ? (
                    <>
                      <p>Forma de Pagamento: {pedidoSelecionado.pagamento.metodo}</p>
                      <p>Status: {pedidoSelecionado.pagamento.status}</p>
                      <p>Valor: R$ {pedidoSelecionado.pagamento.valor}</p>
                      <p>Pago em: {pedidoSelecionado.pagamento.pago_em ? new Date(pedidoSelecionado.pagamento.pago_em).toLocaleString() : 'Aguardando Confirmaçao'}</p>
                      <p>PagBank: {pedidoSelecionado.pagbank_ped_id}</p>
                    </>
                  ) : (
                    <p>Sem pagamento registrado</p>
                  )}
                </section>

                <section>
                  <h3 className="subtitles-sections-adm">Frete</h3>
                  <p>Serviço: {pedidoSelecionado.frete.nome}</p>
                  <p>Entrega: {pedidoSelecionado.frete.prazo} dias úteis</p>
                  <p>Valor: R$ {pedidoSelecionado.frete.valor}</p>
                  <p>Etiqueta ID: {pedidoSelecionado.etiqueta_id}</p>
                  <p>Codigo de Rastreio: {pedidoSelecionado.cod_rastreio}</p>
                </section>
              </div>
            </div>

            <section className="section-itens">
              <h3 className="subtitles-sections-adm">Itens do Pedido</h3>
              <div className="itens-grid-adm">
                {pedidoSelecionado.itens.map((item, i) => (
                  <div className="item-card-adm" key={i}>
                    <img src={item.produto_imagem_url} alt='Imagem do produto' className='img-item-adm'/>
                    <div className="item-pd-info-adm">
                      <div className='boxes-info-pd-adm'>
                        <h3>{item.nome} <span style={{ fontSize: '0.9rem' }}>#{item.produto_id}</span></h3>
                        <p className='compatibilidade-adm'>{item.aparelho_nome}</p>
                      </div>
                      <div className='boxes-valor-pd-adm'>
                        <p>Qtd: {item.quantidade}</p>
                        <p><strong>R$ {item.preco_unitario}</strong></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="container-gerar-etiqueta">
              {pedidoSelecionado.etiqueta_url ? (
                <a href={pedidoSelecionado.etiqueta_url} target="_blank" rel="noopener noreferrer" className="gerar-etiqueta">Baixar Etiqueta</a>
              ) : (
                <button className="gerar-etiqueta" onClick={() => {
                  gerarEtiqueta(pedidoSelecionado.pedido_id)
                  }} disabled={loadingEtiqueta}>
                  {loadingEtiqueta ? "Gerando..." : "Gerar Etiqueta"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPedidos;
