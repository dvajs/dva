import {
  Router,
  Route,
  Link,
  routerRedux,
} from '../../router';

function App() {
  return (
    <div><Link to="/404">1</Link></div>
  );
}

function getRouter() {
  return (
    <Router>
      <Route path="/" component={App}  />
    </Router>
  );
}

routerRedux.push('/');
routerRedux.go('/');
