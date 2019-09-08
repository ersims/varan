import Express from 'express';
import path from 'path';

// Init
const app = Express();
app.set('env', process.env.NODE_ENV || 'production');
app.set('port', process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

// Templates
app.use(Express.static(path.resolve(__dirname, '../../client')));

// Respond
app.get('*', (req, res: Express.Response) => res.json({ success: true }));

// Export app
export default app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${app.get('port')} in ${app.get('env')} mode`);
});
