import './App.css'
import ChatScreen from './ChatScreen';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth-context';
import AuthForm from './AuthForm';
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter >
        <Routes>
          <Route exact path='/chatScreen' element={<ChatScreen/>} />
          <Route exact path='/' element={<AuthForm/>} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
