import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, collectionGroup } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import './Dahboard.css';
import { useUser } from '../../Auth/UserContext';
import UserHeader from '../../UserDashboard/UserHeader';
import UserSidebar from '../../UserDashboard/UserSidebar';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [pickupPendingCount, setPickupPendingCount] = useState(0);
  const [returnPendingCount, setReturnPendingCount] = useState(0);
  const [successfulCount, setSuccessfulCount] = useState(0);
  const [monthlyPickupPending, setMonthlyPickupPending] = useState(0);
  const [monthlyReturnPending, setMonthlyReturnPending] = useState(0);
  const [monthlySuccessful, setMonthlySuccessful] = useState(0);
  const [monthlyTotalBookings, setMonthlyTotalBookings] = useState(0);
  const [topProducts, setTopProducts] = useState([]); // State for top 5 products
  const [loading, setLoading] = useState(false);
  const { userData } = useUser();
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterTitle, setFilterTitle] = useState('');

  const [monthlyFilteredBookings, setMonthlyFilteredBookings] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);
  useEffect(() => {
    const fetchAllBookingsWithUserDetails = async () => {
      setLoading(true);
      try {
        if (!userData?.branchCode) return;

        const branchCode = userData.branchCode;
        console.log('🔍 Branch Code:', branchCode);

        const productsRef = collection(db, `products/${branchCode}/products`);
        const productsSnapshot = await getDocs(productsRef);
        console.log('📦 Products found:', productsSnapshot.size);

        const allBookingFetches = productsSnapshot.docs.map(async (productDoc) => {
          const productId = productDoc.id;
          const { productCode, productName, imageUrls } = productDoc.data();
          console.log(`➡️ Fetching bookings for product: ${productCode} (${productId})`);

          const bookingsRef = collection(db, `products/${branchCode}/products/${productId}/bookings`);
          const bookingsQuery = query(bookingsRef, orderBy('pickupDate', 'asc'));
          const bookingsSnapshot = await getDocs(bookingsQuery);
          console.log(`✅ Bookings for ${productCode}:`, bookingsSnapshot.size);

          return bookingsSnapshot.docs.map((bookingDoc) => {
            const bookingData = bookingDoc.data();
            return {
              productCode,
              productName,
              ...bookingData,
              pickupDate: bookingData.pickupDate?.toDate() || null,
              returnDate: bookingData.returnDate?.toDate() || null,
              createdAt: bookingData.createdAt?.toDate() || null,
              stage: bookingData.userDetails?.stage,
              imageUrls,
            };
          });
        });

        const bookingResults = await Promise.all(allBookingFetches);
        const allBookings = bookingResults.flat();
        console.log('📊 Total bookings fetched:', allBookings.length);

        // Count bookings per product
        const productBookingsCount = {};
        allBookings.forEach((booking) => {
          const { productCode, productName, imageUrls } = booking;
          if (productBookingsCount[productCode]) {
            productBookingsCount[productCode].count += 1;
          } else {
            productBookingsCount[productCode] = { count: 1, productName, imageUrls };
          }
        });

        // Set bookings & calculate stats
        setBookings(allBookings);
        calculateTodaysBookings(allBookings);
        calculateBookingStages(allBookings);
        calculateMonthlyBookings(allBookings);

        // Sort products by booking count and set the top 10
        const sortedProducts = Object.entries(productBookingsCount)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 10)
          .map(([productCode, { count, productName, imageUrls }]) => ({
            productCode,
            count,
            productName,
            imageUrls,
          }));

        setTopProducts(sortedProducts);
      } catch (error) {
        console.error('❌ Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    // Helpers
    const isSameDay = (date1, date2) =>
      date1 && date2 &&
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();

    const getUniqueBookingsByReceiptNumber = (bookings) => {
      const uniqueBookings = new Set();
      return bookings.filter((booking) => {
        const isUnique = booking.receiptNumber && !uniqueBookings.has(booking.receiptNumber);
        if (isUnique) uniqueBookings.add(booking.receiptNumber);
        return isUnique;
      });
    };

    const calculateTodaysBookings = (allBookings) => {
      const today = new Date();
      const uniqueTodaysBookings = getUniqueBookingsByReceiptNumber(
        allBookings.filter((booking) =>
          booking.createdAt && isSameDay(booking.createdAt, today)
        )
      );
      setTodaysBookings(uniqueTodaysBookings.length);
    };

    const calculateBookingStages = (allBookings) => {
      const today = new Date();
      const uniqueBookings = getUniqueBookingsByReceiptNumber(allBookings);

      const pickupPending = uniqueBookings.filter((booking) =>
        booking.stage === 'pickupPending' && isSameDay(booking.pickupDate, today)
      ).length;

      const returnPending = uniqueBookings.filter((booking) =>
        booking.stage === 'returnPending' && isSameDay(booking.returnDate, today)
      ).length;

      const successful = uniqueBookings.filter((booking) =>
        booking.stage === 'successful' && isSameDay(booking.returnDate, today)
      ).length;

      setPickupPendingCount(pickupPending);
      setReturnPendingCount(returnPending);
      setSuccessfulCount(successful);
    };

    const calculateMonthlyBookings = (allBookings) => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const uniqueBookings = getUniqueBookingsByReceiptNumber(allBookings);

      const monthlyPickupPending = uniqueBookings.filter((booking) =>
        booking.pickupDate?.getMonth() === currentMonth &&
        booking.pickupDate?.getFullYear() === currentYear &&
        booking.stage === 'pickupPending'
      ).length;

      const monthlyReturnPending = uniqueBookings.filter((booking) =>
        booking.returnDate?.getMonth() === currentMonth &&
        booking.returnDate?.getFullYear() === currentYear &&
        booking.stage === 'returnPending'
      ).length;

      const monthlySuccessful = uniqueBookings.filter((booking) =>
        booking.returnDate?.getMonth() === currentMonth &&
        booking.returnDate?.getFullYear() === currentYear &&
        booking.stage === 'successful'
      ).length;

      const monthlyTotal = uniqueBookings.filter((booking) =>
        booking.pickupDate?.getMonth() === currentMonth &&
        booking.pickupDate?.getFullYear() === currentYear
      ).length;

      setMonthlyPickupPending(monthlyPickupPending);
      setMonthlyReturnPending(monthlyReturnPending);
      setMonthlySuccessful(monthlySuccessful);
      setMonthlyTotalBookings(monthlyTotal);
    };

    fetchAllBookingsWithUserDetails();
  }, [userData?.branchCode]);
  const groupBookingsByReceiptNumber = (bookings) => {
    const grouped = {};

    bookings.forEach((booking) => {
      const receipt = booking.receiptNumber;
      if (!receipt) return;

      if (!grouped[receipt]) {
        grouped[receipt] = {
          receiptNumber: receipt,
          createdAt: booking.createdAt,
          customerName: booking.customerName,
          stage: booking.stage,
          bookings: [],
        };
      }
      grouped[receipt].bookings.push(booking); // All products under this receipt
    });

    return Object.values(grouped); // Return as array
  };


  const handleShowFilteredBookings = (filterType) => {
    const today = new Date();
    let filtered = [];

    switch (filterType) {
      case 'todaysBookings':
        filtered = bookings.filter(
          (b) => b.createdAt &&
            b.createdAt.getDate() === today.getDate() &&
            b.createdAt.getMonth() === today.getMonth() &&
            b.createdAt.getFullYear() === today.getFullYear()
        );
        setFilterTitle("Today's Bookings");
        break;

      case 'pickupPending':
        filtered = bookings.filter(
          (b) => b.stage === 'pickupPending' &&
            b.pickupDate &&
            b.pickupDate.getDate() === today.getDate() &&
            b.pickupDate.getMonth() === today.getMonth() &&
            b.pickupDate.getFullYear() === today.getFullYear()
        );
        setFilterTitle('Today’s Pickup Pending');
        break;

      case 'returnPending':
        filtered = bookings.filter(
          (b) => b.stage === 'returnPending' &&
            b.returnDate &&
            b.returnDate.getDate() === today.getDate() &&
            b.returnDate.getMonth() === today.getMonth() &&
            b.returnDate.getFullYear() === today.getFullYear()
        );
        setFilterTitle('Today’s Return Pending');
        break;

      case 'successful':
        filtered = bookings.filter(
          (b) => b.stage === 'successful' &&
            b.returnDate &&
            b.returnDate.getDate() === today.getDate() &&
            b.returnDate.getMonth() === today.getMonth() &&
            b.returnDate.getFullYear() === today.getFullYear()
        );
        setFilterTitle('Today’s Successful Bookings');
        break;

      default:
        filtered = [];
        setFilterTitle('');
    }
    const grouped = groupBookingsByReceiptNumber(filtered);
    setFilteredBookings(grouped);
  };

  const filterMonthlyBookings = (type) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const isCurrentMonth = (date) =>
      date?.getMonth() === currentMonth && date?.getFullYear() === currentYear;

    const filtered = bookings.filter((b) => {
      switch (type) {
        case 'pickupPending':
          return b.stage === 'pickupPending' && isCurrentMonth(b.pickupDate);
        case 'returnPending':
          return b.stage === 'returnPending' && isCurrentMonth(b.returnDate);
        case 'successful':
          return b.stage === 'successful' && isCurrentMonth(b.returnDate);
        case 'total':
          return isCurrentMonth(b.pickupDate);
        default:
          return false;
      }
    });

    const grouped = groupBookingsByReceiptNumber(filtered);
    setFilteredBookings(grouped);   // ✅ re-using filteredBookings state
    switch (type) {
      case 'pickupPending':
        setFilterTitle('Monthly Pickup Pending');
        break;
      case 'returnPending':
        setFilterTitle('Monthly Return Pending');
        break;
      case 'successful':
        setFilterTitle('Monthly Successful Bookings');
        break;
      case 'total':
        setFilterTitle('Monthly Total Bookings');
        break;
      default:
        setFilterTitle('');
    }
  };



  return (
  <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
    <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

    <div className="reports-container">
      <UserHeader
        onMenuClick={handleSidebarToggle}
        isSidebarOpen={sidebarOpen}
      />

      {/* =======================
          TODAY'S REPORT
      ======================= */}
      <section style={{ marginLeft: '10px', marginTop: '100px' }}  className="dashboard-section">
        <header  className="section-header">
          <h4 >Today’s Overview</h4>
          <p className="section-subtitle">Live booking performance</p>
        </header>

        <div className="kpi-grid">
          <div
            className="kpi-card primary"
            onClick={() => handleShowFilteredBookings("todaysBookings")}
          >
            <span>Today's Bookings</span>
            <strong>{todaysBookings}</strong>
          </div>

          <div
            className="kpi-card warning"
            onClick={() => handleShowFilteredBookings("pickupPending")}
          >
            <span>Pick-up Pending</span>
            <strong>{pickupPendingCount}</strong>
          </div>

          <div
            className="kpi-card info"
            onClick={() => handleShowFilteredBookings("returnPending")}
          >
            <span>Return Pending</span>
            <strong>{returnPendingCount}</strong>
          </div>

          <div
            className="kpi-card success"
            onClick={() => handleShowFilteredBookings("successful")}
          >
            <span>Successful</span>
            <strong>{successfulCount}</strong>
          </div>
        </div>
      </section>

      {/* =======================
          MONTHLY OVERVIEW
      ======================= */}
      <section className="dashboard-section">
        <header className="section-header">
          <h4>Monthly Overview</h4>
          <p className="section-subtitle">Bookings summary for this month</p>
        </header>

        <div className="kpi-grid">
          <div
            className="kpi-card neutral"
            onClick={() => filterMonthlyBookings("total")}
          >
            <span>Total Bookings</span>
            <strong>{monthlyTotalBookings}</strong>
          </div>

          <div
            className="kpi-card warning"
            onClick={() => filterMonthlyBookings("pickupPending")}
          >
            <span>Pick-up Pending</span>
            <strong>{monthlyPickupPending}</strong>
          </div>

          <div
            className="kpi-card info"
            onClick={() => filterMonthlyBookings("returnPending")}
          >
            <span>Return Pending</span>
            <strong>{monthlyReturnPending}</strong>
          </div>

          <div
            className="kpi-card success"
            onClick={() => filterMonthlyBookings("successful")}
          >
            <span>Successful</span>
            <strong>{monthlySuccessful}</strong>
          </div>
        </div>
      </section>

      {/* =======================
          FILTERED BOOKINGS MODAL
      ======================= */}
      {filteredBookings.length > 0 && (
        <div className="modal-overlayy" onClick={() => setFilteredBookings([])}>
          <div className="modal-boxx" onClick={(e) => e.stopPropagation()}>
            <button
              className="modall-close-btn"
              onClick={() => setFilteredBookings([])}
            >
              ×
            </button>

            <h4>{filterTitle}</h4>

            <table>
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Created At</th>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Pickup</th>
                  <th>Return</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((group, i) => {
                  const { receiptNumber, bookings } = group;
                  const b = bookings[0] || {};

                  return (
                    <tr key={i}>
                      <td>{receiptNumber}</td>
                      <td>{b.createdAt?.toLocaleDateString() || "-"}</td>
                      <td>{b.userDetails?.name || "-"}</td>
                      <td>{b.userDetails?.contact || "-"}</td>
                      <td>{b.userDetails?.email || "-"}</td>
                      <td>
                        {bookings
                          .map(
                            (item) =>
                              `${item.productCode} × ${item.quantity}`
                          )
                          .join(", ")}
                      </td>
                      <td>{b.pickupDate?.toLocaleDateString() || "-"}</td>
                      <td>{b.returnDate?.toLocaleDateString() || "-"}</td>
                      <td>{b.stage || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =======================
          TOP PRODUCTS
      ======================= */}
      <section className="dashboard-section">
        <header className="section-header">
          <h4>Top Products</h4>
          <p className="section-subtitle">Most booked products</p>
        </header>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Product</th>
                <th>Code</th>
                <th>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={product.imageUrls}
                      alt={product.productName}
                      className="product-thumb"
                    />
                  </td>
                  <td>{product.productName}</td>
                  <td>{product.productCode}</td>
                  <td>{product.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
);

};

export default Dashboard;

