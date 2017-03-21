import dva, { connect } from '../../mobile';

const app = dva();
app.use({});
app.model({ namespace: 'count' });
app.router(() => ({}));
app.start();

connect()();
