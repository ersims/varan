// Dependencies
import Express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';

// Init
const app = new Express();
app.engine('hbs', exphbs());
app.set('env', process.env.NODE_ENV || 'production');
app.set('port', parseInt(process.env.PORT, 10) || 3000);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, '..', '..', 'templates'));

// Templates
app.use(Express.static(path.resolve(__dirname, '..', '..', 'client')));

// Render react server side
app.get('*', res => res.json({ success: true }));

// Export app
export default app.listen(app.get('port'), () => {
  console.log(`Server listening on ${app.get('port')} in ${app.get('env')} mode`);
});
