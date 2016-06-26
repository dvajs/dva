import React, { Component, PropTypes } from 'react';
import styles from './Product.less';
import { Icon } from 'antd';

function Product(props) {
  const { id, thumb_url, vote, title, description, submitter } = props.data;
  function handleVote() {
    props.dispatch({
      type: 'products/vote',
      payload: id,
    });
  }
  return (
    <div className={styles.normal}>
      <div className={styles.thumbUrl}>
        <img src={thumb_url} width="124" height="102" />
      </div>
      <div className={styles.vote}>
        {vote}
        <Icon type="caret-up" className={styles.voteBtn} onClick={handleVote} />
      </div>
      <div className={styles.detail}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
        <div className={styles.submitter}>Submitted by: {submitter}</div>
      </div>
    </div>
  );
}

Product.propTypes = {};

export default Product;
