import React, { useEffect, useState } from "react";
import api from "../../../hooks/useApi";
import "./AdminPedidos.css";

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ searchValue: "" });

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
      setPedidos(response.data);
      setForm({ searchValue: "" });
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro inesperado");
      console.error("Erro ao buscar pedidos:", err);
    }
  };

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
              <span>{pedido.pedido_id}</span>
              <span>{pedido.usuario.nome}</span>
              <span>R$ {pedido.total}</span>
              <span>{pedido.status}</span>
              <span>{new Date(pedido.criado_em).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {pedidoSelecionado && (
        <div className="modal-adm">
          <div className="modal-content-adm">
            <h2>Detalhes do Pedido #{pedidoSelecionado.pedido_id}</h2>

            <div className="modal-grid-adm">
              <div>
                <section>
                  <h3 className="subtitles-sections-adm">Informações Gerais</h3>
                  <p>Status: {pedidoSelecionado.status}</p>
                  <p>Data do Pedido:{new Date(pedidoSelecionado.criado_em).toLocaleString()}</p>
                  <p>Total: R$ {pedidoSelecionado.total}</p>
                </section>

                <section>
                  <h3 className="subtitles-sections-adm">Endereço a ser entregue</h3>
                  <p>Rua: {pedidoSelecionado.endereco.rua}</p>
                  <p>Número: {pedidoSelecionado.endereco.numero}</p>
                  <p>Bairro: {pedidoSelecionado.endereco.bairro}</p>
                  <p>Cidade: {pedidoSelecionado.endereco.cidade}</p>
                  <p>Estado: {pedidoSelecionado.endereco.estado}</p>
                  <p>CEP: {pedidoSelecionado.endereco.cep}</p>
                  <p>Complemento: {pedidoSelecionado.endereco.complemento}</p>
                </section>
              </div>

              <div>
                <section>
                  <h3 className="subtitles-sections-adm">Pagamento</h3>
                  {pedidoSelecionado.pagamento ? (
                    <>
                      <p>Forma de Pagamento: {pedidoSelecionado.pagamento.metodo}</p>
                      <p>Status: {pedidoSelecionado.pagamento.status}</p>
                      <p>Pago em: {new Date(pedidoSelecionado.pagamento.pago_em).toLocaleString()}</p>
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
                </section>
              </div>
            </div>

            <section>
              <h3 className="subtitles-sections-adm">Itens do Pedido</h3>
              <div className="itens-grid-adm">
                {pedidoSelecionado.itens.map((item, i) => (
                  <div className="item-card-adm" key={i}>
                    <img src={item.produto_imagem_url} alt='Imagem do produto' className='img-item-adm'/>
                    <div className="item-pd-info-adm">
                      <div className='boxes-info-pd-adm'>
                        <h3>{item.nome} <span className='span-id-adm'>ID: #{item.produto_id}</span></h3>
                        <p className='compatibilidade-adm'>{item.aparelho_nome}</p>
                    </div>
                    <div className='boxes-valor-pd-adm'>
                        <p>Qtd: {item.quantidade}</p>
                        <p>R$ {item.preco_unitario}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button onClick={() => setPedidoSelecionado(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPedidos;
