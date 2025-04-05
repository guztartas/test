import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [prices, setPrices] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch products
        fetch('http://localhost:5000/api/products')
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                // Fetch prices for the first SKU of each product
                data.forEach((product) => {
                    const firstSku = product.skus[0]?.code;
                    if (firstSku) {
                        fetch(`http://localhost:5000/api/stock-price/${firstSku}`)
                            .then((res) => res.json())
                            .then((data) => {
                                if (!data.error) {
                                    setPrices((prev) => ({
                                        ...prev,
                                        [product.id]: data.price,
                                    }));
                                }
                            })
                            .catch(() => {
                                console.error(`Failed to fetch price for SKU ${firstSku}`);
                            });
                    }
                });
            })
            .catch((err) => {
                setError('Failed to load products');
                window.alert('Failed to load products');
            });
    }, []);

    const handleAddToCart = (product) => {
        const price = prices[product.id] || 0;
        window.alert(`Add to cart: ${product.brand}, Price: $${(price / 100).toFixed(2)}`);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="product-list">
            <header className="header">
                <div className="top">
                    <div className="menu-icon">
                        <img src="/icons/menu-icon.svg" alt="lock" />
                    </div>
                    <div className="user-profile">
                        <img src="/icons/Sin título-1.jpg" alt="User Profile" className="user-profile-icon" />
                    </div>
                </div>
                <h1 className="greeting"><span>Hi Mr. Michael, </span><br />Welcome Back!</h1>
            </header>
            <h2 className="section-title">Our Products</h2>
            <div className="product-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <Link
                            to={`/product/${product.id}`}
                            className="product-link"
                        >
                            <h3>{product.brand}</h3>
                            <img src={product.image} alt={product.brand} className="product-image" />
                        </Link>
                        <div className="product-details">
                            <div className="rating" data-rating={product.rating}>
                                <span className="star">★</span>
                                <span className="value">{product?.rating?.toFixed(1)}</span>
                            </div>
                            <div className="price">
                                ${prices[product.id] ? (prices[product.id] / 100).toFixed(2) : 'Loading...'}
                            </div>
                            <button
                                className="add-to-cart"
                                onClick={() => handleAddToCart(product)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;