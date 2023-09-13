/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import QRCode from 'react-qr-code';

function App() {
  const [isBuying, setIsBuying] = useState(false);
  const [coinList, setCoinList] = useState([{}]);
  const [quotation, setQuotation] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const [pixQrCode, setPixQrCode] = useState('');
  const [brCode, setBrCode] = useState('');
  const [payment, setPayment] = useState({
    amount: '',
    currency: '',
    expiresAt: '',
    id: '',
    payment: {
      amountHumanized: '',
      walletToTransfer: '',
    },
  });

  //campos do form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [selectedToken, setSelectedToken] = useState({ symbol: 'default' });
  const [network, setNetwork] = useState(56);

  const networkNames = {
    10: 'Optimism',
    56: 'BSC',
    137: 'Polygon',
    42161: 'Arbitrum',
  };

  const handleSelectCoin = (e) => {
    const sel = e.target.value;
    const token = coinList.filter((c) => c.symbol === sel);

    if (token.symbol === 'default') return;

    setSelectedToken(token[0]);
    setNetwork(token[0].networks[0].id);
  };

  // Atrelar webhooks a um link de pagamento
  const linkWebhookToCheckout = async (checkoutId) => {
    const headers = {
      accept: '*/*',
      api: process.env.REACT_APP_API_KEY,
      secret: process.env.REACT_APP_API_SECRET,
      'Content-Type': 'application/json',
    };

    const data = {
      "url": "https://webhook.site/7a99f181-a306-427e-9fe1-9c8c4d4f767c",
      "headers": [
        {
          "sua-chave": "seu-valor"
        }
      ]
    }
    

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URI}/checkouts/${checkoutId}/webhooks`,
        data,
        { headers }
      );
      console.log('Webhooks subscribed', res);
    } catch (error) {
      console.log(error);
    }
  };

  // Cria um invoice para pagamento por PIX com o Link de pagamento.
  const handlePixPayment = async () => {
    setPaymentMethod('PIX');

    const data = {
      network: 56,
      currency: 'BRL',
      amount: 2000,
      requester: {
        name: 'Nome de exemplo',
        email: 'emailDeTeste@teste.com',
        document: '546.446.830-78',
      },
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URI}/orders/${process.env.REACT_APP_CHECKOUT_ID}/checkout`,
        data
      );
      const qrURI = res.data.payment.qrCode;
      const brURI = res.data.payment.brCode;

      setBrCode(brURI);
      setPixQrCode(qrURI);
      linkWebhookToCheckout(process.env.REACT_APP_CHECKOUT_ID);
    } catch (error) {
      console.log(error);
    }
  };

  // Cria um invoice para pagamento por Cripto com o Link de pagamento.
  const handleCriptoPayment = async (e) => {
    e.preventDefault();

    const data = {
      network: parseInt(network),
      currency: selectedToken.symbol,
      amount: 1000,
      requester: {
        name: name,
        email: email,
        document: document,
      },
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URI}/orders/${process.env.REACT_APP_CHECKOUT_ID}/checkout`,
        data
      );

      setPayment(res.data);
      linkWebhookToCheckout(process.env.REACT_APP_CHECKOUT_ID);
    } catch (error) {
      console.log(error);
    }
  };

  // Devolve a lista dos tokens disponiveis.
  const getTokenList = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URI}/quotation/tokens/network/137`
      );

      const sortedTokens = res.data.sort((a, b) => {
        return a.symbol.localeCompare(b.symbol);
      });

      const filteredTokens = sortedTokens.filter((token) => {
        return token.networks.some((network) => network.id === 56);
      });

      setCoinList(filteredTokens);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectNetwork = (e) => {
    e.preventDefault();
    setNetwork(e.target.innerText);
  };

  // Gerando uma cotação.
  const retrieveQuote = async () => {
    if (selectedToken.symbol === 'default') return;

    setIsQuoting(true);

    const data = {
      network: network,
      from: 'BRL',
      to: selectedToken.symbol,
      amount: 10000,
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URI}/quotation`,
        data
      );
      setQuotation(res.data.toTokenAmount);
      setIsQuoting(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    retrieveQuote();
  }, [network, selectedToken]);

  useEffect(() => {
    getTokenList();
  }, []);

  return (
    <div className="App">
      <h1 style={{ margin: '24px' }}>checkout-starter-project</h1>
      {!isBuying && (
        <div
          style={{
            width: '20%',
            padding: '20px',
            borderRadius: '13px',
            background: '#cadffa',
          }}
        >
          <img
            src="https://www.tradeinn.com/f/13912/139127271/dc-shoes-tenis-versatile.jpg"
            height={250}
            width="auto"
            style={{ borderRadius: '13px' }}
          />
          <p>
            Sapatos <strong>DC Shoes</strong>
          </p>
          <p>
            <strong>Valor: </strong>R$100
          </p>
          <button
            onClick={() => setIsBuying(true)}
            style={{
              marginTop: '1em',
              padding: '14px',
              background: '#265a9e',
              color: '#fff',
              fontWeight: 700,
              width: '250px',
            }}
          >
            Comprar
          </button>
        </div>
      )}

      {isBuying && paymentMethod === '' && (
        <>
          <button onClick={() => setPaymentMethod('Cripto')}>
            Pagar com Criptomoedas
          </button>
          <button onClick={handlePixPayment}>Pagar com PIX</button>
          <button
            onClick={() => {
              setPaymentMethod('');
              setIsBuying(false);
            }}
          >
            Cancelar
          </button>
        </>
      )}

      {isBuying && paymentMethod === 'Cripto' && payment.id === '' && (
        <div>
          <h2>Você está comprando:</h2>
          <h3>Producto: 1 x DC Shoes</h3>
          <h3>
            Valor: <strong>R$</strong>100,00
          </h3>
          <form onSubmit={handleCriptoPayment} encType="multipart/form-data">
            <label htmlFor="name">Nome: </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
            />
            <br />
            <br />
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
            />
            <br />
            <br />
            <label htmlFor="email">CPF: </label>
            <input
              type="document"
              id="document"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="Digite seu cpf"
            />
            <br />
            <br />
            <label htmlFor="selectValue">Escolha o token: </label>
            <select
              id="selectValue"
              value={selectedToken.symbol || '---'}
              onChange={handleSelectCoin}
              style={{
                paddingLeft: '1em',
                paddingRight: '1em',
                paddingTop: '0.5em',
                paddingBottom: '0.5em',
              }}
            >
              <option value="default" disabled>
                Seleccione un token
              </option>
              {coinList.map((t) => (
                <option value={t.symbol} key={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
            {selectedToken.symbol !== 'default' ? (
              <div>
                <h3>Você escolheu o token {selectedToken.name}</h3>
                {selectedToken.symbol !== 'default' &&
                selectedToken['networks'].length > 1 ? (
                  <>
                    <h3>Blockchain: {network}</h3>
                    <h3>Trocar a rede:</h3>
                    {selectedToken.networks.map((n) => (
                      <button
                        onClick={handleSelectNetwork}
                        key={n.id}
                        style={{
                          padding: '10px',
                          marginLeft: '5px',
                        }}
                      >
                        {networkNames[n.id]}
                      </button>
                    ))}
                  </>
                ) : (
                  <></>
                )}
                <h5>
                  {isQuoting
                    ? 'aguarde por favor...'
                    : `Sua cotação: ${
                        Number(quotation) / 1000000000000000000
                      } ${selectedToken.symbol}`}
                </h5>
              </div>
            ) : (
              <></>
            )}
            <br />
            <button
              type="submit"
              onClick={() => setIsBuying(true)}
              style={{
                marginTop: '1em',
                padding: '14px',
                background: '#4bb80d',
                color: '#fff',
                fontWeight: 700,
                width: '250px',
              }}
            >
              Comprar
            </button>
          </form>
          <button
            onClick={() => {
              setPaymentMethod('');
              setIsBuying(false);
            }}
            style={{
              marginTop: '1em',
              padding: '14px',
              background: '#e33b3b',
              color: '#fff',
              fontWeight: 700,
              width: '250px',
            }}
          >
            Cancelar
          </button>
        </div>
      )}
      {isBuying && paymentMethod === 'PIX' && (
        <div style={{ width: '43%' }}>
          <h1>Tela de Pagamento</h1>
          <h4>Use seu celular para escanear o QR Code.</h4>
          {!pixQrCode ? (
            <p>Carregando...</p>
          ) : (
            <img
              src={pixQrCode}
              referrerPolicy="no-referrer"
              width="350px"
            ></img>
          )}
          <p>
            <strong>brCode:</strong> {brCode.substring(0, 6)}...
            {brCode.substring(142)}
          </p>
          <button
            onClick={() => {
              setPaymentMethod('');
              setIsBuying(false);
              setPixQrCode(null);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
      {payment.id !== '' && (
        <>
          <h2>Tela de Pagamento por Criptomoedas</h2>
          <h3>
            Voce esta pagando {payment.payment.amountHumanized}{' '}
            {payment.currency}
          </h3>
          <QRCode size={152} value={payment.payment.walletToTransfer} />
          <button
            style={{ marginTop: '1em' }}
            onClick={() => {
              setPaymentMethod('');
              setPayment({ id: '' });
              setIsBuying(false);
            }}
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}

export default App;
