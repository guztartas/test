import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetails() {
    const { id, brand } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [stockPrice, setStockPrice] = useState({});
    const [error, setError] = useState(null);
    const [selectedSku, setSelectedSku] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((data) => {
                const foundProduct = data.find((p) => p.id === parseInt(id));
                if (foundProduct) {
                    setProduct(foundProduct);
                    setSelectedSku(foundProduct.skus[0]);
                } else {
                    setError('Product not found');
                    window.alert('Product not found');
                }
            })
            .catch((err) => {
                setError('Failed to load product details');
                window.alert('Failed to load product details');
            });
    }, [id]);

    useEffect(() => {
        if (!product || !selectedSku) return;

        const fetchStockPrice = () => {
            fetch(`http://localhost:5000/api/stock-price/${selectedSku.code}`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch stock/price');
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data.error) {
                        window.alert(`Failed to load stock/price for SKU ${selectedSku.code}`);
                    } else {
                        setStockPrice((prev) => ({
                            ...prev,
                            [selectedSku.code]: data,
                        }));
                    }
                })
                .catch((err) => {
                    console.error('Stock/price fetch error:', err);
                    window.alert(`Failed to load stock/price for SKU ${selectedSku.code}`);
                });
        };

        fetchStockPrice();
        const interval = setInterval(fetchStockPrice, 5000);
        return () => clearInterval(interval);
    }, [product, selectedSku]);

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!product) {
        return <div className="loading">Loading...</div>;
    }

    const handleAddToCart = () => {
        const stockInfo = stockPrice[selectedSku.code] || { stock: 0, price: 0 };
        window.alert(
            `Add to cart: ${product.brand} - ${selectedSku.name}, Price: $${(stockInfo.price / 100).toFixed(2)}, Stock: ${stockInfo.stock}`
        );
    };

    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };

    const selectedStock = stockPrice[selectedSku?.code]?.stock || 0;
    const selectedPrice = stockPrice[selectedSku?.code]?.price || 0;

    return (
        <div className="product-details">
            <header className="pdp-header">
                <div className="menu-icon">
                    <button className="back-button" onClick={() => navigate('/products')}>
                        <img src="/icons/back-icon.svg" alt="lock" />
                    </button>
                </div>
                <h1 className="pdp-title">Detail</h1>
                <div className="menu-icon">
                    <img src="/icons/icon-dots.svg" alt="lock" />
                </div>
            </header>
            <img src={product.image} alt={product.brand} className="product-details-image" />
            <div className="product-details-info">
                <div className="product-header">
                    <h1>{product.brand}</h1>
                    <div className="price">${(selectedPrice / 100).toFixed(2)}</div>
                </div>
                <div className="product-meta">
                    <span>Origin: {product.origin}</span> | <span>Stock: {selectedStock}</span>
                </div>
                <div className="product-info">
                    <h2>Description</h2>
                    <p>
                        {isExpanded
                            ? product.information
                            : `${product.information.substring(0, 100)}...`}
                        <span className="read-more" onClick={toggleDescription}>
                            {isExpanded ? ' Read less' : ' Read more'}
                        </span>
                    </p>
                </div>
                <div className="size-selection">
                    <h2>Size</h2>
                    <div className="size-buttons">
                        {product.skus.map((sku) => (
                            <button
                                key={sku.code}
                                className={`size-button ${selectedSku?.code === sku.code ? 'selected' : ''}`}
                                onClick={() => setSelectedSku(sku)}
                            >
                                {sku.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="add-to-cart-wrapper" onClick={handleAddToCart}>
                    <button className="icon-button" disabled={selectedStock === 0}>
                        <img src="/icons/lock.svg" alt="lock" />
                    </button>
                    <button className="text-button" disabled={selectedStock === 0}>
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;