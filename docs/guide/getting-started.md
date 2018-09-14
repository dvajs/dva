# Quick Start

## Install dva-cli

Install dva-cli via npm and make sure the version is `0.9.1` or above.

```bash
$ npm install dva-cli -g
$ dva -v
dva-cli version 0.9.1
```

## Create New App

After installing dva-cli, you can access the `dva` command from the command line ([Cannot access?](http://stackoverflow.com/questions/15054388/global-node-modules-not-installing-correctly-command-not-found)). Now you can create new apps with `dva new`.

```bash
$ dva new dva-quickstart
```

This creates the `dva-quickstart` directory, which contains the project initialization directories and files, and provides development server, build scripts, data mock services, proxy servers, and more.

Then we `cd` enter the `dva-quickstart` directory and start the development server：

```bash
$ cd dva-quickstart
$ npm start
```

After a few seconds, you will see the following output：

```bash
Compiled successfully!

The app is running at:

  http://localhost:8000/

Note that the development build is not optimized.
To create a production build, use npm run build.
```

Open http://localhost:8000 in your browser and you will see the dva welcome screen.

## Use antd

Install `antd` and `babel-plugin-import` via npm. `babel-plugin-import` is used to load antd scripts and styles on demand. See [repo](https://github.com/ant-design/babel-plugin-import).

```bash
$ npm install antd babel-plugin-import --save
```

Edit `.webpackrc` to make the `babel-plugin-import` plugin take effect.

```diff
{
+  "extraBabelPlugins": [
+    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }]
+  ]
}
```

> Note: dva-cli implements build and dev based on roadhog. For more configuration of `.webpackrc`, see [roadhog#config](https://github.com/sorrycc/roadhog#配置)

## Defining Routes

We have to write an application to display the product list first. The first step is to create a route that can be thought of as a different page that makes up the application.

New route component `routes/Products.js`, the content is as follows：

```javascript
import React from 'react';

const Products = (props) => (
  <h2>List of Products</h2>
);

export default Products;
```

Add routing information to the routing table, edit `router.js`:

```diff
+ import Products from './routes/Products';
...
+ <Route path="/products" exact component={Products} />
```

Then open http://localhost:8000/#/products in your browser and you should see the `<h2>` tag defined earlier.

## Write UI Component

As your app grows, you'll need to share UI elements on multiple pages (or use it multiple times on a single page), and in dva you can pull this part into components.

Let's write a `ProductList` component so that we can display the product list in different places.

Create a new `components/ProductList.js` file:

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { Table, Popconfirm, Button } from 'antd';

const ProductList = ({ onDelete, products }) => {
  const columns = [{
    title: 'Name',
    dataIndex: 'name',
  }, {
    title: 'Actions',
    render: (text, record) => {
      return (
        <Popconfirm title="Delete?" onConfirm={() => onDelete(record.id)}>
          <Button>Delete</Button>
        </Popconfirm>
      );
    },
  }];
  return (
    <Table
      dataSource={products}
      columns={columns}
    />
  );
};

ProductList.propTypes = {
  onDelete: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
};

export default ProductList;
```

## Model Definition

Once the UI is complete, the data and logic are now processed.

Dva manages a domain model through the concept of model, including reducers that update state synchronously, handles the effects of asynchronous logic, and subscribes to subscriptions for data sources.

New model `models/products.js`：

```javascript
export default {
  namespace: 'products',
  state: [],
  reducers: {
    'delete'(state, { payload: id }) {
      return state.filter(item => item.id !== id);
    },
  },
};
```

In this model:

- `namespace` indicates the key on the global state
- `state` is the initial value, here is an empty array
- `reducers` is equivalent to reducer in redux, receives action, synchronizes state

Then don't forget to load him in `index.js`:

```diff
// 3. Model
+ app.model(require('./models/products').default);
```

## Connect up

At this point, we have completed the model and component separately, so how do they connect together?

Dva provides a connect method. If you are familiar with redux, this connect is the connect of react-redux.

Edit `routes/Products.js` and replace it with the following:

```javascript
import React from 'react';
import { connect } from 'dva';
import ProductList from '../components/ProductList';

const Products = ({ dispatch, products }) => {
  function handleDelete(id) {
    dispatch({
      type: 'products/delete',
      payload: id,
    });
  }
  return (
    <div>
      <h2>List of Products</h2>
      <ProductList onDelete={handleDelete} products={products} />
    </div>
  );
};

// export default Products;
export default connect(({ products }) => ({
  products,
}))(Products);
```

Finally, we need some initial data to get the application run. Edit `index.js`:

```diff
- const app = dva();
+ const app = dva({
+   initialState: {
+     products: [
+       { name: 'dva', id: 1 },
+       { name: 'antd', id: 2 },
+     ],
+   },
+ });
```

Refresh the browser, you should see the following effects:

<p style="text-align: center">
  <img src="https://zos.alipayobjects.com/rmsportal/GQJeDDeUCSTRMMg.gif" />
</p>

## Build an app

Once the development is complete and verified in the development environment, it needs to be deployed to our users. First execute the following command:

```bash
$ npm run build
```

After a few seconds, the output should look like this:

```bash
> @ build /private/tmp/myapp
> roadhog build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  82.98 KB  dist/index.js
  270 B     dist/index.css
```

The `build` command will package all resources, including JavaScript, CSS, web fonts, images, html, and more. Then you can find these files in the `dist/` directory.
