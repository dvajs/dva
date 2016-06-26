import React, { Component, PropTypes } from 'react';
import styles from './ProductList.less';
import Product from './Product';
import { Spin } from 'antd';

function ProductList(props) {
  return (
    <div className={styles.normal}>
      <Spin spinning={props.loading}>
        {
          props.data.map(product => <Product
            key={product.id}
            data={product}
            dispatch={props.dispatch}
          />)
        }
      </Spin>
    </div>
  );
}

ProductList.propTypes = {};

export default ProductList;
