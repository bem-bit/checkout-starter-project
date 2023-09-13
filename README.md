<img src="https://www.bembit.com/bembit_logo.svg" width="450" />

# checkout-starter-project
## Template de integração dos serviços Bembit

Este projeto serve como um modelo ilustrativo para a integração com os pontos de extremidade (EndPoints) da API da Bembit. Ele contém a implementação fundamental dos procedimentos necessários para a geração e gerenciamento de transações de pagamento e cobrança. Essa implementação foi desenvolvida para simplificar o processo de integração com qualquer sistema que demande uma solução para gateway de pagamento. O objetivo é oferecer uma base sólida para o desenvolvimento de integrações mais complexas, permitindo assim uma adoção mais rápida e eficiente da API da Bembit como mecanismo de transação financeira.

Para informações mais detalhadas consulte a nossa <a href="https://docs.bembit.com" target="_blank">Documentação</a>, ou se preferir pode testar cada um dos EndPoints no <a href="https://api.bembit.com/docs/" target="_blank">Swagger</a>.

### Instalação:
```shell
git clone https://github.com/bem-bit/checkout-starter-project.git
```

```shell
cd checkout-starter-project
```

### Para instalação das dependências:
```shell
yarn
```

### Configuração:

Mudar o arquivo **.env.** template a **.env** e preencher com as variaveis de entorno. 

### Variaveis de entorno:

- **REACT_APP_API_KEY**: _String_ aleatório gerado na sua conta cadastrada, na opção "**API KEYS**" do menu lateral.
- **REACT_APP_API_SECRET**: _String_ aleatório gerado na sua conta cadastrada, na opção "**API KEYS**" do menu lateral.
- **REACT_APP_BASE_URI**: Utilzar ***https://api-sandbox.bembit.com/api/v1*** para testes e ***https://api.bembit.com/api/v1*** em Produção.
- **REACT_APP_CHECKOUT_ID**: String identificador do link de pagamento criado desde sua conta na app.bembit.com

### Para iniciar o app
```shell
yarn start
```

Ao escolher uma opção de pagamento a lógica de negociação do app realiza um request aos end-points da bembit segundo a opção escolhida:

Caso o cliente escolher pagamento por PIX, a request é construida da seguinte forma:

```javascript
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

      console.log(res)

      setBrCode(brURI);
      setPixQrCode(qrURI);
    } catch (error) {
      console.log(error);
    }
  };
```

Se o cliente escolher pagamento por Cripto, a request é construida assim:

```javascript
const handleCriptoPayment = async (e) => {
    e.preventDefault();

    const data = {
      network: network,
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
      console.log(res.data);

      // generateCriptoQrCode()
    } catch (error) {
      console.log(error);
    }
  };
```
