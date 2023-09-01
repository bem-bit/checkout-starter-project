/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import Web3 from 'web3';

function App() {
  const [isBuying, setIsBuying] = useState(false);
  const [coinList, setCoinList] = useState([{}]);
  const [quotation, setQuotation] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);

  const urlBase = 'https://api-sandbox.bembit.com/api/v1';

  //campos do form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedToken, setSelectedToken] = useState({ symbol: 'default' });
  const [network, setNetwork] = useState('56');

  const handleSelectCoin = (e) => {
    const sel = e.target.value;
    const token = coinList.filter((c) => c.symbol === sel);

    if (token.symbol === 'default') return;

    setSelectedToken(token[0]);

    if (token[0].networks.length > 1) {
      setNetwork(token[0].networks[0].id);
      console.log('Primera red:', token[0].networks[0].id);
    } else {
      setNetwork(token[0].networks[0].id);
      console.log('Unica red', token[0].networks[0].id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const getTokenList = async () => {
    try {
      const res = await axios.get(`${urlBase}/quotation/tokens/network/56`);
      setCoinList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectNetwork = (e) => {
    e.preventDefault();
    setNetwork(e.target.innerText);
  };

  const retrieveQuote = async () => {
    if (selectedToken.symbol === 'default') return;

    setIsQuoting(true);

    const data = {
      network: Number(network),
      from: 'BRL',
      to: selectedToken.symbol,
      amount: 10000,
    };

    try {
      const res = await axios.post(`${urlBase}/quotation`, data);
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
          <button onClick={() => setPaymentMethod('PIX')}>Pagar com PIX</button>
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

      {isBuying && paymentMethod === 'Cripto' && (
        <div>
          <h2>Você está comprando:</h2>
          <h3>Producto: 1 x DC Shoes</h3>
          <h3>
            Valor: <strong>R$</strong>100,00
          </h3>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* <label htmlFor="name">Nome: </label>
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
            <br /> */}
            <label htmlFor="selectValue">Escolha o token: </label>
            <select
              id="selectValue"
              value={selectedToken.symbol || '---'}
              onChange={handleSelectCoin}
              style={{paddingLeft: "1em", paddingRight: "1em", paddingTop: "0.5em", paddingBottom: "0.5em"}}
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
                    <h3>Escolha a rede:</h3>
                    {selectedToken.networks.map((n) => (
                      <button
                        onClick={handleSelectNetwork}
                        style={{
                          padding: '10px',
                          marginLeft: '5px',
                          background: network === n.id && '#2d7bcf',
                          color: network === n.id && '#fff',
                        }}
                      >
                        {n.id}
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
      {/* {
        isBuying && paymentMethod === 'Cripto' && ()
      } */}
    </div>
  );
}

export default App;
