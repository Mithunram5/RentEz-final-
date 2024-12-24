import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Dashboardlayout';
import '../styles/Orderstatus.css';
import { fetchRentalRequests, updateRentalRequestStatus } from '../api';

const OrderDetails = ({ order, onClose }) => {
  const handleAction = async (newStatus) => {
    try {
      await updateRentalRequestStatus(order._id, newStatus);
      // Optionally, update the order status in the parent state
    } catch (error) {
      console.error("Failed to update order status:", error.message);
    }
  };

  const renderButtonsByStatus = () => {
    switch (order.status) {
      case 'Pending':
        return (
          <>
            <button className="accept" onClick={() => handleAction('Payment Pending')}>Accept</button>
            <button className="reject" onClick={() => handleAction('Rejected')}>Reject</button>
          </>
        );
      case 'Payment Pending':
        return (
          <>
            <button className="accept" onClick={() => handleAction('Waiting to Ship')}>Paid</button>
            <button className="reject" onClick={() => handleAction('Rejected')}>Reject</button>
          </>
        );
      case 'Waiting to Ship':
        return (
          <>
            <button className="accept" onClick={() => handleAction('Shipped')}>Ship</button>
            <button className="reject" onClick={() => handleAction('Rejected')}>Reject</button>
          </>
        );
      case 'Shipped':
        return (
          <button className="accept" onClick={() => handleAction('Delivered')}>Deliver</button>
        );
      case 'Delivered':
        return (
          <button className="accept" onClick={() => handleAction('Returned')}>Return</button>
        );
      case 'Rejected':
        return <p className="info">Order has been rejected.</p>;
      default:
        return <p className="info">Order completed.</p>;
    }
  };

  return (
    <div className="order-modal-overlay">
      <div className="order-container">
        <div className="order-header">
          <h1>Order ID: <span>#{order.orderId}</span></h1>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        <div className="order-content">
          <div className="product-details">
            <img
              src={order.imageUrl || 'placeholder-image.png'}
              alt={order.productName}
              className="product-image"
            />
            <div className="row-arrange1">
              <h2>{order.productName}</h2>
              <p className="subtitle">Driller</p>
            </div>
            <p><strong>Pickup:</strong> {order.placedOn}</p>
            <p><strong>Dropoff:</strong> {order.arriveOn}</p>
            <p className="price">₹{order.price} <span className="qty">Qty: {order.quantity}</span></p>
          </div>
        </div>
        <div className="summary-info">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-item"><span>Rent per day</span><span>₹{order.price}</span></div>
            <div className="summary-item"><span>No of days</span><span>{order.days}</span></div>
            <div className="summary-item"><span>Delivery</span><span>₹{order.delivery || '0.00'}</span></div>
            <div className="summary-item"><span>Tax</span><span>₹{order.tax}</span></div>
            <div className="summary-total"><span>Total</span><span>₹{order.total}</span></div>
          </div>
          <div className="delivery-info">
            <p><strong>Delivery To:</strong> {order.customerName}, {order.address}</p>
            <p><strong>Contact:</strong> {order.contact}</p>
            <p><strong>Order date:</strong> {order.orderDate}</p>
            <p><strong>Delivery by:</strong> {order.deliveryDate}</p>
            <p><strong>Return by:</strong> {order.returnDate}</p>
          </div>
        </div>
        <div className="buttons">
          <div className="actions">{renderButtonsByStatus()}</div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [filter, setFilter] = useState({ date: '', status: '', category: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orders, setOrders] = useState([]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const applyFilters = () => {
    const filtered = orders.filter(order => {
      const isWithinDateRange = !filter.date || (new Date(order.fromDate) <= new Date(filter.date) && new Date(order.endDate) >= new Date(filter.date));
      return isWithinDateRange &&
        (!filter.status || order.status === filter.status) &&
        (!filter.category || order.category === filter.category);
    });
    setFilteredOrders(filtered);
  };

  const resetFilters = () => {
    setFilter({ date: '', status: '', category: '' });
    setFilteredOrders(orders);
  };

  const currentOrders = Array.isArray(filteredOrders) ? filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder) : [];

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await fetchRentalRequests();
        console.log("Fetched Orders:", fetchedOrders); // Debugging log
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error.message);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    console.log("Orders:", orders);
    console.log("Filtered Orders:", filteredOrders);
  }, [orders, filteredOrders]);

  return (
    <DashboardLayout>
      <div className="orders-page">
        <h1>Order Status</h1>
        <div className="filter-bar">
          <input type="date" name="date" value={filter.date} onChange={handleFilterChange} />
          <select name="status" value={filter.status} onChange={handleFilterChange}>
            <option value="">Order Status</option>
            <option value="Shipped">Shipped</option>
            <option value="Payment">Payment</option>
            <option value="Rejected">Rejected</option>
            <option value="Delivered">Delivered</option>
            <option value="Requested">Requested</option>
            <option value="Canceled">Canceled</option>
            <option value="Returned">Returned</option>
          </select>
          <select name="category" value={filter.category} onChange={handleFilterChange}>
            <option value="">Category</option>
            <option value="Construction">Construction</option>
            <option value="Excavation">Excavation</option>
            <option value="Welding">Welding</option>
          </select>
          <button onClick={applyFilters}>Filter</button>
          <button onClick={resetFilters}>Reset Filter</button>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Order ID</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Placed On</th>
              <th>Arrive On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map(order => {
                // Debugging log to verify order structure
                console.log("Order Object:", order);

                const productName = order.productId?.name || 'Unnamed Product';
                const productImage = order.productId?.images?.[0] || 'https://via.placeholder.com/150';
                const category = order.category || 'Unknown';

                return (
                  <tr key={order._id}>
                    <td><img src={productImage} alt={productName} className="order-image" /></td>
                    <td>{productName}</td>
                    <td>{category}</td>
                    <td>{order.orderId}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.price}</td>
                    <td>{order.fromDate}</td>
                    <td>{order.endDate}</td>
                    <td><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td>
                      <button className="details-button" onClick={() => handleViewDetails(order)}>View Details</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="no-orders">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
          <span>Page {currentPage}</span>
          <button disabled={indexOfLastOrder >= filteredOrders.length} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        </div>
      </div>
      {isModalOpen && <OrderDetails order={selectedOrder} onClose={handleCloseModal} />}
    </DashboardLayout>
  );
};

export default Orders;