import express from 'express';
import bodyParser from 'body-parser';

import indexRouter from '@/routes/index.route';

const port = process.env.PORT || 3000;
const app = express();

app.set('port', port);

// middlewares
app.use(bodyParser.json());

// routes
app.use('/', indexRouter);

// server listening
app.listen(app.get('port'), () => {
  console.log('Server is running on port', app.get('port'));
});
