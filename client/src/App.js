import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import {ApolloProvider, ApolloClient, InMemoryCache} from '@apollo/client';
import Clients from './components/Clients';

const client = new ApolloClient({
  uri: 'http://localhost:42069/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <>
    <ApolloProvider client={client}>
      <Header/>
        <div className="container">
          <Clients/>
        </div>
    </ApolloProvider>
    </>
  );
}

export default App;
