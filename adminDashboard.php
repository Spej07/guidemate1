<?php
session_start();
if (empty($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header('Location: signinTouristAdmin.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cebu Admin Command | AdventureSync</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/feather-icons"></script>
    <link rel="stylesheet" href="adminDashboard.css">
</head>
<body>

    <nav class="glass-nav">
        <div class="logo">GuideMate Admin </div>
        <div class="nav-links">
            <span class="active">REAL-TIME MAP</span>
            <span>FLEET STATUS</span>
            <span>REVENUE</span>
            <a href="add_admin.php" style="color:inherit;text-decoration:none;font-size:0.9rem;" class="nav-link">ADD ADMIN</a>
            <a href="add_spot.php" style="color:inherit;text-decoration:none;font-size:0.9rem;" class="nav-link">ADD SPOT</a>
            <a href="logout.php" class="logout-link">LOGOUT</a>
        </div>
        <div class="user-id"><i data-feather="shield"></i> Admin Panel</div>
    </nav>

    <header class="dashboard-header">
        <p id="dashboardCurrentDate"><?= strtoupper(date('F j, Y')) ?></p>
        <h1>Admin Dashboard</h1>
    </header>

    <div class="stats-row" id="statsRow">
        <div class="stat-card">
            <label>Total users</label>
            <div class="value" id="statTotalUsers">—</div>
        </div>
        <div class="stat-card">
            <label>Total guides</label>
            <div class="value blue-glow" id="statTotalGuides">—</div>
        </div>
        <div class="stat-card">
            <label>Total destinations</label>
            <div class="value" id="statTotalDestinations">—</div>
        </div>
    </div>

    <!-- User management panel -->
    <section class="pending-guides-section">
        <h2 class="panel-section-title">User management panel</h2>
    </section>
    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>All tour guides</h3>
                <span class="pending-subtitle">Complete list of all registered tour guides and their status (Pending, Active on landing page, or Suspended).</span>
            </div>
            <div id="allGuidesContainer">
                <p class="pending-loading" id="allGuidesLoading">Loading…</p>
                <table class="pending-table" id="allGuidesTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Guide</th>
                            <th>Email</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="allGuidesBody"></tbody>
                </table>
                <p class="pending-empty" id="allGuidesEmpty" style="display: none;">No tour guides registered yet.</p>
            </div>
        </div>
    </section>
    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>Manage tour guides – Add to landing page</h3>
                <span class="pending-subtitle">Newly registered guides appear below. Approve each one to add them to the landing page so tourists can search and book them.</span>
            </div>
            <div id="pendingGuidesContainer">
                <p class="pending-loading" id="pendingLoading">Loading…</p>
                <table class="pending-table" id="pendingGuidesTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Guide</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="pendingGuidesBody"></tbody>
                </table>
                <p class="pending-empty" id="pendingEmpty" style="display: none;">No pending guides. When a guide registers, they will appear here for you to add to the landing page.</p>
            </div>
        </div>
    </section>

    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>Pending guide bookings</h3>
                <span class="pending-subtitle">Tourist booking requests appear here. Approve one to mark the guide as booked by that tourist.</span>
            </div>
            <div id="pendingBookingsContainer">
                <p class="pending-loading" id="pendingBookingsLoading">Loading…</p>
                <table class="pending-table" id="pendingBookingsTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Tourist</th>
                            <th>Guide</th>
                            <th>Requested</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="pendingBookingsBody"></tbody>
                </table>
                <p class="pending-empty" id="pendingBookingsEmpty" style="display: none;">No pending booking requests.</p>
            </div>
        </div>
    </section>

    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>Manage tour guides – On landing page</h3>
                <span class="pending-subtitle">Remove a guide from the landing page for 1–3 days if they did not appear on the exact time. They will automatically reappear after that, or you can re-add them earlier from the section below.</span>
            </div>
            <div id="activeGuidesContainer">
                <p class="pending-loading" id="activeLoading">Loading…</p>
                <table class="pending-table" id="activeGuidesTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Guide</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="activeGuidesBody"></tbody>
                </table>
                <p class="pending-empty" id="activeEmpty" style="display: none;">No guides on the landing page right now. Add pending guides above first.</p>
            </div>
        </div>
    </section>

    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>Manage tour guides – Suspended</h3>
                <span class="pending-subtitle">Guides removed from the landing page (e.g. did not appear on exact time). They will be visible to tourists again after the return date, or you can re-add them now.</span>
            </div>
            <div id="suspendedGuidesContainer">
                <p class="pending-loading" id="suspendedLoading">Loading…</p>
                <table class="pending-table" id="suspendedGuidesTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Guide</th>
                            <th>Return to landing page</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="suspendedGuidesBody"></tbody>
                </table>
                <p class="pending-empty" id="suspendedEmpty" style="display: none;">No suspended guides.</p>
            </div>
        </div>
    </section>

    <!-- Destination management panel -->
    <section class="pending-guides-section">
        <h2 class="panel-section-title">Destination management panel</h2>
    </section>
    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>Manage tourist spots</h3>
                <span class="pending-subtitle">Every tourist spot is listed below. Select multiple and delete duplicates or unavailable spots at once. Change the price or delete a spot if it’s unavailable (it will be removed from the landing page).</span>
            </div>
            <div id="spotsPriceContainer">
                <p class="pending-loading" id="spotsPriceLoading">Loading…</p>
                <div id="spotsBulkActions" style="display: none; margin-bottom: 0.5rem;">
                    <button type="button" class="delete-spots-bulk-btn" id="deleteSpotsBulkBtn">Delete selected spots</button>
                </div>
                <table class="pending-table" id="spotsPriceTable" style="display: none;">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="spotsSelectAll" title="Select all"></th>
                            <th>Spot</th>
                            <th>Price (e.g. 2,500)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="spotsPriceBody"></tbody>
                </table>
                <p class="pending-empty" id="spotsPriceEmpty" style="display: none;">No tourist spots yet. <a href="add_spot.php">Add a spot</a> first.</p>
            </div>
        </div>
    </section>

    <!-- Review moderation section -->
    <section class="pending-guides-section">
        <h2 class="panel-section-title">Review moderation section</h2>
    </section>
    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>Manage tourist reviews</h3>
                <span class="pending-subtitle">All reviews from tourists (for guides or locations). Remove inappropriate reviews so they no longer appear on guide profiles or elsewhere.</span>
            </div>
            <div id="reviewsAdminContainer">
                <p class="pending-loading" id="reviewsAdminLoading">Loading…</p>
                <table class="pending-table" id="reviewsAdminTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Tourist</th>
                            <th>Guide / Location</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Reply</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="reviewsAdminBody"></tbody>
                </table>
                <p class="pending-empty" id="reviewsAdminEmpty" style="display: none;">No tourist reviews yet.</p>
            </div>
        </div>
    </section>

    <!-- Handle reported reviews -->
    <section class="pending-guides-section">
        <h2 class="panel-section-title">Handle reported reviews</h2>
    </section>
    <section class="pending-guides-section">
        <div class="panel pending-panel">
            <div class="panel-head">
                <h3>Reported reviews</h3>
                <span class="pending-subtitle">Reviews that have been reported by users will appear here. You can dismiss the report or remove the review.</span>
            </div>
            <div id="reportedReviewsContainer">
                <p class="pending-empty" id="reportedReviewsEmpty">No reported reviews. When users report a review, it will appear here for moderation.</p>
            </div>
        </div>
    </section>

    <!-- System maintenance tools -->
    <section class="pending-guides-section">
        <h2 class="panel-section-title">System maintenance tools</h2>
    </section>

    <main class="admin-grid">
        <div class="panel table-panel">
            <div class="panel-head">
                <h3>Live Island Deployments</h3>
                <i data-feather="refresh-cw"></i>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Guide</th>
                        <th>Cebu Location</th>
                        <th>Pax</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>John Lloyd Noya</b></td>
                        <td>Kawasan Falls, Badian</td>
                        <td>12</td>
                        <td><span class="badge badge-tour">ON-TOUR</span></td>
                    </tr>
                    <tr>
                        <td><b>Benjohn Paran</b></td>
                        <td>Virgin Island, Bantayan</td>
                        <td>6</td>
                        <td><span class="badge badge-tour">ON-TOUR</span></td>
                    </tr>
                    <tr>
                        <td><b>Jay-em Rosalita</b></td>
                        <td>Oslob Whalesharks</td>
                        <td>15</td>
                        <td><span class="badge badge-wait">WAITING</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="panel feed-panel">
            <h3>REGIONAL_INCIDENTS</h3>
            <div class="feed-list">
                <div class="feed-item alert">
                    <span class="time">08:42</span>
                    <p><b>OSLOB:</b> Signal Lost - Guide #44</p>
                </div>
                <div class="feed-item success">
                    <span class="time">09:15</span>
                    <p><b>BADIAN:</b> 12 Pax started Canyoneering</p>
                </div>
                <div class="feed-item">
                    <span class="time">09:30</span>
                    <p><b>BANTAYAN:</b> Weather Optimal</p>
                </div>
            </div>
            <div class="command-actions">
                <button class="cmd-btn btn-danger">BROADCAST EMERGENCY</button>
                <button class="cmd-btn">GENERATE DAILY REPORT</button>
            </div>
        </div>
    </main>

    <script src="logout_modal.js"></script>
    <script>feather.replace();</script>
    <script>
    (function() {
        var logoutLink = document.querySelector('a.logout-link');
        if (logoutLink && typeof showLogoutConfirm === 'function') {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                showLogoutConfirm(function() { window.location.href = 'logout.php'; });
            });
        }
    })();
    (function() {
        const body = document.getElementById('pendingGuidesBody');
        const table = document.getElementById('pendingGuidesTable');
        const loading = document.getElementById('pendingLoading');
        const empty = document.getElementById('pendingEmpty');

        var FETCH_TIMEOUT_MS = 12000;
        function fetchWithTimeout(url, options, timeoutMs) {
            timeoutMs = timeoutMs || FETCH_TIMEOUT_MS;
            var ctrl = new AbortController();
            var id = setTimeout(function() { ctrl.abort(); }, timeoutMs);
            options = options || {};
            options.signal = ctrl.signal;
            return fetch(url, options).then(function(r) { clearTimeout(id); return r; }, function(err) { clearTimeout(id); throw err; });
        }

        function loadPending() {
            if (!loading) return;
            loading.style.display = 'block';
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'none';

            fetchWithTimeout('get_pending_guides.php', { credentials: 'same-origin' })
                .then(function(r) {
                    if (r.status === 403) { window.location.href = 'signinTouristAdmin.html'; return []; }
                    return r.json();
                })
                .then(function(data) {
                    loading.style.display = 'none';
                    if (!Array.isArray(data) || data.length === 0) {
                        if (empty) empty.style.display = 'block';
                        return;
                    }
                    if (table) table.style.display = 'table';
                    if (body) {
                        body.innerHTML = data.map(function(g) {
                            return '<tr data-guide-id="' + g.guide_id + '">' +
                                '<td><b>' + escapeHtml(g.name) + '</b></td>' +
                                '<td><button type="button" class="approve-guide-btn" data-guide-id="' + g.guide_id + '">Add to landing page</button></td>' +
                                '</tr>';
                        }).join('');
                    }
                    document.querySelectorAll('.approve-guide-btn').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.getAttribute('data-guide-id');
                            if (!id) return;
                            this.disabled = true;
                            this.textContent = 'Adding…';
                            var form = new FormData();
                            form.append('guide_id', id);
                            fetch('approve_guide.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok) {
                                        var row = document.querySelector('tr[data-guide-id="' + id + '"]');
                                        if (row) row.remove();
                                        if (body && body.rows.length === 0) {
                                            if (table) table.style.display = 'none';
                                            if (empty) { empty.style.display = 'block'; empty.textContent = 'No pending guides. When a guide registers, they will appear here for you to add to the landing page.'; }
                                        }
                                    } else {
                                        alert(res.error || 'Could not approve.');
                                        btn.disabled = false;
                                        btn.textContent = 'Add to landing page';
                                    }
                                })
                                .catch(function() {
                                    alert('Request failed.');
                                    btn.disabled = false;
                                    btn.textContent = 'Add to landing page';
                                });
                        });
                    });
                })
                .catch(function() {
                    loading.style.display = 'none';
                    if (empty) { empty.innerHTML = 'Could not load. Request failed or timed out. Open this page via your server (e.g. <code>http://localhost/guidemate1/adminDashboard.php</code>) and ensure Apache and MySQL are running.'; empty.style.display = 'block'; }
                });
        }

        function loadPendingBookings() {
            var loading = document.getElementById('pendingBookingsLoading');
            var table = document.getElementById('pendingBookingsTable');
            var body = document.getElementById('pendingBookingsBody');
            var empty = document.getElementById('pendingBookingsEmpty');
            if (!loading) return;
            loading.style.display = 'block';
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'none';

            fetchWithTimeout('get_pending_bookings.php', { credentials: 'same-origin' })
                .then(function(r) {
                    if (r.status === 403) { window.location.href = 'signinTouristAdmin.html'; return []; }
                    return r.json();
                })
                .then(function(data) {
                    loading.style.display = 'none';
                    if (!Array.isArray(data) || data.length === 0) {
                        if (empty) empty.style.display = 'block';
                        return;
                    }
                    if (table) table.style.display = 'table';
                    if (body) {
                        body.innerHTML = data.map(function(b) {
                            return '<tr data-booking-id="' + b.booking_id + '">' +
                                '<td><b>' + escapeHtml(b.tourist_name) + '</b></td>' +
                                '<td>' + escapeHtml(b.guide_name) + '</td>' +
                                '<td>' + escapeHtml(b.created_at || '') + '</td>' +
                                '<td><button type="button" class="approve-booking-btn" data-booking-id="' + b.booking_id + '">Approve booking</button></td>' +
                                '</tr>';
                        }).join('');
                    }
                    document.querySelectorAll('.approve-booking-btn').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.getAttribute('data-booking-id');
                            if (!id) return;
                            this.disabled = true;
                            this.textContent = 'Approving…';
                            var form = new FormData();
                            form.append('booking_id', id);
                            fetch('approve_booking.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok) {
                                        var row = document.querySelector('tr[data-booking-id="' + id + '"]');
                                        if (row) row.remove();
                                        if (body && body.rows.length === 0) {
                                            if (table) table.style.display = 'none';
                                            if (empty) empty.style.display = 'block';
                                        }
                                    } else {
                                        alert(res.error || 'Could not approve booking.');
                                        btn.disabled = false;
                                        btn.textContent = 'Approve booking';
                                    }
                                })
                                .catch(function() {
                                    alert('Request failed.');
                                    btn.disabled = false;
                                    btn.textContent = 'Approve booking';
                                });
                        });
                    });
                })
                .catch(function() {
                    loading.style.display = 'none';
                    if (empty) { empty.innerHTML = 'Could not load booking requests.'; empty.style.display = 'block'; }
                });
        }

        function escapeHtml(s) {
            if (s == null) return '';
            var div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML;
        }

        function loadAllGuides() {
            var loading = document.getElementById('allGuidesLoading');
            var table = document.getElementById('allGuidesTable');
            var body = document.getElementById('allGuidesBody');
            var empty = document.getElementById('allGuidesEmpty');
            if (!loading) return;
            loading.style.display = 'block';
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'none';
            fetchWithTimeout('get_all_guides_admin.php', { credentials: 'same-origin' })
                .then(function(r) { if (r.status === 403) { window.location.href = 'signinTouristAdmin.html'; return []; } return r.json(); })
                .then(function(data) {
                    loading.style.display = 'none';
                    if (!Array.isArray(data) || data.length === 0) {
                        if (empty) empty.style.display = 'block';
                        return;
                    }
                    if (table) table.style.display = 'table';
                    if (body) {
                        body.innerHTML = data.map(function(g) {
                            return '<tr data-guide-id="' + g.guide_id + '">' +
                                '<td><b>' + escapeHtml(g.name) + '</b></td>' +
                                '<td>' + escapeHtml(g.email) + '</td>' +
                                '<td>' + escapeHtml(g.status) + '</td></tr>';
                        }).join('');
                    }
                })
                .catch(function() { loading.style.display = 'none'; if (empty) { empty.innerHTML = 'Could not load all guides.'; empty.style.display = 'block'; } });
        }

        function loadActiveGuides() {
            var loading = document.getElementById('activeLoading');
            var table = document.getElementById('activeGuidesTable');
            var body = document.getElementById('activeGuidesBody');
            var empty = document.getElementById('activeEmpty');
            if (!loading) return;
            loading.style.display = 'block';
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'none';
            fetchWithTimeout('get_active_guides.php', { credentials: 'same-origin' })
                .then(function(r) { if (r.status === 403) { window.location.href = 'signinTouristAdmin.html'; return []; } return r.json(); })
                .then(function(data) {
                    loading.style.display = 'none';
                    if (!Array.isArray(data) || data.length === 0) {
                        if (empty) empty.style.display = 'block';
                        return;
                    }
                    if (table) table.style.display = 'table';
                    if (body) {
                        body.innerHTML = data.map(function(g) {
                            return '<tr data-guide-id="' + g.guide_id + '">' +
                                '<td><b>' + escapeHtml(g.name) + '</b></td>' +
                                '<td>' + escapeHtml(g.email) + '</td>' +
                                '<td><span class="punish-actions"><button type="button" class="punish-btn" data-guide-id="' + g.guide_id + '" data-days="1">1 day</button> <button type="button" class="punish-btn" data-guide-id="' + g.guide_id + '" data-days="2">2 days</button> <button type="button" class="punish-btn" data-guide-id="' + g.guide_id + '" data-days="3">3 days</button></span></td></tr>';
                        }).join('');
                    }
                    document.querySelectorAll('#activeGuidesBody .punish-btn').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.getAttribute('data-guide-id');
                            var days = this.getAttribute('data-days');
                            if (!id || !days) return;
                            this.disabled = true;
                            var form = new FormData();
                            form.append('guide_id', id);
                            form.append('days', days);
                            fetch('suspend_guide.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok) { loadAllGuides(); loadActiveGuides(); loadSuspendedGuides(); } else { alert(res.error || 'Failed'); this.disabled = false; }
                                }.bind(this))
                                .catch(function() { alert('Request failed.'); this.disabled = false; }.bind(this));
                        });
                    });
                })
                .catch(function() { loading.style.display = 'none'; if (empty) { empty.innerHTML = 'Could not load. Request failed or timed out. Use the site via your server and ensure Apache and MySQL are running.'; empty.style.display = 'block'; } });
        }

        function loadSuspendedGuides() {
            var loading = document.getElementById('suspendedLoading');
            var table = document.getElementById('suspendedGuidesTable');
            var body = document.getElementById('suspendedGuidesBody');
            var empty = document.getElementById('suspendedEmpty');
            if (!loading) return;
            loading.style.display = 'block';
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'none';
            fetchWithTimeout('get_suspended_guides.php', { credentials: 'same-origin' })
                .then(function(r) { if (r.status === 403) return []; return r.json(); })
                .then(function(data) {
                    loading.style.display = 'none';
                    if (!Array.isArray(data) || data.length === 0) {
                        if (empty) empty.style.display = 'block';
                        return;
                    }
                    if (table) table.style.display = 'table';
                    if (body) {
                        body.innerHTML = data.map(function(g) {
                            return '<tr data-guide-id="' + g.guide_id + '">' +
                                '<td><b>' + escapeHtml(g.name) + '</b></td>' +
                                '<td>' + escapeHtml(g.suspended_until || '—') + '</td>' +
                                '<td><button type="button" class="pardon-btn" data-guide-id="' + g.guide_id + '">Re-add to landing page</button></td></tr>';
                        }).join('');
                    }
                    document.querySelectorAll('#suspendedGuidesBody .pardon-btn').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.getAttribute('data-guide-id');
                            if (!id) return;
                            this.disabled = true;
                            var form = new FormData();
                            form.append('guide_id', id);
                            fetch('pardon_guide.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok) { loadAllGuides(); loadActiveGuides(); loadSuspendedGuides(); } else { this.disabled = false; }
                                }.bind(this))
                                .catch(function() { this.disabled = false; }.bind(this));
                        });
                    });
                })
                .catch(function() { loading.style.display = 'none'; if (empty) { empty.innerHTML = 'Could not load. Request failed or timed out.'; empty.style.display = 'block'; } });
        }

        function loadSpotsPrice() {
            var loading = document.getElementById('spotsPriceLoading');
            var table = document.getElementById('spotsPriceTable');
            var body = document.getElementById('spotsPriceBody');
            var empty = document.getElementById('spotsPriceEmpty');
            if (!loading) return;
            loading.style.display = 'block';
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'none';
            fetchWithTimeout('get_spots_admin.php', { credentials: 'same-origin' })
                .then(function(r) {
                    if (r.status === 403) { window.location.href = 'signinTouristAdmin.html'; return []; }
                    return r.json();
                })
                .then(function(data) {
                    loading.style.display = 'none';
                    if (!Array.isArray(data)) {
                        if (empty) { empty.innerHTML = 'Could not load spots. Try again or <a href="add_spot.php">add a spot</a> first.'; empty.style.display = 'block'; }
                        return;
                    }
                    if (data.length === 0) {
                        if (empty) empty.style.display = 'block';
                        return;
                    }
                    if (table) table.style.display = 'table';
                    var bulkActions = document.getElementById('spotsBulkActions');
                    if (bulkActions && data.length > 0) bulkActions.style.display = 'block';
                    if (body) {
                        body.innerHTML = data.map(function(s) {
                            return '<tr data-destination-id="' + s.destination_id + '">' +
                                '<td><input type="checkbox" class="spot-row-checkbox" data-destination-id="' + s.destination_id + '"></td>' +
                                '<td><b>' + escapeHtml(s.name) + '</b></td>' +
                                '<td><input type="text" class="spot-price-input" data-destination-id="' + s.destination_id + '" value="' + escapeHtml(s.price || '') + '" placeholder="e.g. 2,500"></td>' +
                                '<td><span class="spot-actions"><button type="button" class="save-spot-price-btn" data-destination-id="' + s.destination_id + '">Save</button> <button type="button" class="delete-spot-btn" data-destination-id="' + s.destination_id + '">Delete</button></span></td></tr>';
                        }).join('');
                    }
                    var selectAll = document.getElementById('spotsSelectAll');
                    if (selectAll) {
                        selectAll.checked = false;
                        selectAll.onclick = function() {
                            document.querySelectorAll('.spot-row-checkbox').forEach(function(cb) { cb.checked = selectAll.checked; });
                        };
                    }
                    var bulkBtn = document.getElementById('deleteSpotsBulkBtn');
                    if (bulkBtn) {
                        bulkBtn.onclick = function() {
                            var ids = [];
                            document.querySelectorAll('.spot-row-checkbox:checked').forEach(function(cb) {
                                var id = cb.getAttribute('data-destination-id');
                                if (id) ids.push(id);
                            });
                            if (ids.length === 0) { alert('Select at least one spot to delete.'); return; }
                            if (!confirm('Remove ' + ids.length + ' selected spot(s)? They will no longer appear on the landing page.')) return;
                            bulkBtn.disabled = true;
                            bulkBtn.textContent = 'Deleting…';
                            var form = new FormData();
                            ids.forEach(function(id) { form.append('destination_ids[]', id); });
                            fetch('delete_spots_bulk.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok) {
                                        ids.forEach(function(id) {
                                            var row = document.querySelector('tr[data-destination-id="' + id + '"]');
                                            if (row) row.remove();
                                        });
                                        if (body.rows.length === 0) {
                                            if (table) table.style.display = 'none';
                                            if (empty) empty.style.display = 'block';
                                            var ba = document.getElementById('spotsBulkActions');
                                            if (ba) ba.style.display = 'none';
                                        }
                                        if (selectAll) selectAll.checked = false;
                                    } else {
                                        alert(res.error || 'Could not delete.');
                                    }
                                    bulkBtn.disabled = false;
                                    bulkBtn.textContent = 'Delete selected spots';
                                })
                                .catch(function() {
                                    alert('Request failed.');
                                    bulkBtn.disabled = false;
                                    bulkBtn.textContent = 'Delete selected spots';
                                });
                        };
                    }
                    document.querySelectorAll('.save-spot-price-btn').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.getAttribute('data-destination-id');
                            if (!id) return;
                            var row = document.querySelector('tr[data-destination-id="' + id + '"]');
                            var input = row ? row.querySelector('.spot-price-input') : null;
                            var price = input ? input.value.trim() : '';
                            this.disabled = true;
                            this.textContent = 'Saving…';
                            var form = new FormData();
                            form.append('destination_id', id);
                            form.append('price', price);
                            fetch('update_spot_price.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok) {
                                        this.textContent = 'Saved';
                                        var t = this;
                                        setTimeout(function() { t.textContent = 'Save'; t.disabled = false; }, 1500);
                                    } else {
                                        alert(res.error || 'Could not save.');
                                        this.disabled = false;
                                        this.textContent = 'Save';
                                    }
                                }.bind(this))
                                .catch(function() {
                                    alert('Request failed.');
                                    this.disabled = false;
                                    this.textContent = 'Save';
                                }.bind(this));
                        });
                    });
                    document.querySelectorAll('.delete-spot-btn').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.getAttribute('data-destination-id');
                            if (!id) return;
                            var row = document.querySelector('tr[data-destination-id="' + id + '"]');
                            var spotName = row && row.cells[0] ? row.cells[0].textContent.trim() : 'This spot';
                            if (!confirm('Remove "' + spotName + '"? It will no longer appear on the landing page.')) return;
                            this.disabled = true;
                            this.textContent = 'Deleting…';
                            var form = new FormData();
                            form.append('destination_id', id);
                            fetch('delete_spot.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok && row) {
                                        row.remove();
                                        if (body.rows.length === 0) {
                                            if (table) table.style.display = 'none';
                                            if (empty) empty.style.display = 'block';
                                        }
                                    } else {
                                        alert(res.error || 'Could not delete.');
                                        this.disabled = false;
                                        this.textContent = 'Delete';
                                    }
                                }.bind(this))
                                .catch(function() {
                                    alert('Request failed.');
                                    this.disabled = false;
                                    this.textContent = 'Delete';
                                }.bind(this));
                        });
                    });
                })
                .catch(function() {
                    loading.style.display = 'none';
                    if (empty) { empty.innerHTML = 'Could not load spots. Request failed or timed out. Open via <code>http://localhost/guidemate1/adminDashboard.php</code> and ensure Apache and MySQL are running.'; empty.style.display = 'block'; }
                });
        }

        function loadReviewsAdmin() {
            var loading = document.getElementById('reviewsAdminLoading');
            var table = document.getElementById('reviewsAdminTable');
            var body = document.getElementById('reviewsAdminBody');
            var empty = document.getElementById('reviewsAdminEmpty');
            if (!loading) return;
            loading.style.display = 'block';
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'none';
            fetchWithTimeout('get_reviews_admin.php', { credentials: 'same-origin' })
                .then(function(r) {
                    if (r.status === 403) { window.location.href = 'signinTouristAdmin.html'; return []; }
                    return r.json();
                })
                .then(function(data) {
                    loading.style.display = 'none';
                    if (!Array.isArray(data)) {
                        if (empty) { empty.textContent = 'Could not load reviews.'; empty.style.display = 'block'; }
                        return;
                    }
                    if (data.length === 0) {
                        if (empty) empty.style.display = 'block';
                        return;
                    }
                    if (table) table.style.display = 'table';
                    if (body) {
                        body.innerHTML = data.map(function(r) {
                            var stars = (r.rating >= 1 && r.rating <= 5) ? '★'.repeat(r.rating) : (r.rating || '—');
                            var commentShort = (r.comment || '').length > 80 ? (r.comment.substring(0, 77) + '…') : (r.comment || '—');
                            var replyShort = (r.reply_text || '').length > 50 ? (r.reply_text.substring(0, 47) + '…') : (r.reply_text || '—');
                            var guideAndLocation = [r.guide_name || '', r.location_name || ''].filter(Boolean).join(' @ ');
                            if (!guideAndLocation) guideAndLocation = r.subject || '—';
                            var reviewType = (r.review_type || 'location').toUpperCase();
                            return '<tr data-review-id="' + r.review_id + '">' +
                                '<td>' + escapeHtml(r.tourist_name) + '</td>' +
                                '<td>' + escapeHtml(guideAndLocation) + ' <small>(' + escapeHtml(reviewType) + ')</small></td>' +
                                '<td>' + stars + '</td>' +
                                '<td title="' + escapeAttr(r.comment || '') + '">' + escapeHtml(commentShort) + '</td>' +
                                '<td title="' + escapeAttr(r.reply_text || '') + '">' + escapeHtml(replyShort) + '</td>' +
                                '<td>' + escapeHtml(r.created_at || '') + '</td>' +
                                '<td><button type="button" class="delete-review-admin-btn" data-review-id="' + r.review_id + '">Delete</button></td></tr>';
                        }).join('');
                    }
                    document.querySelectorAll('.delete-review-admin-btn').forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var id = this.getAttribute('data-review-id');
                            if (!id) return;
                            if (!confirm('Remove this review? It will be permanently deleted.')) return;
                            this.disabled = true;
                            this.textContent = 'Deleting…';
                            var row = document.querySelector('tr[data-review-id="' + id + '"]');
                            var form = new FormData();
                            form.append('review_id', id);
                            fetch('delete_review_admin.php', { method: 'POST', credentials: 'same-origin', body: form })
                                .then(function(r) { return r.json(); })
                                .then(function(res) {
                                    if (res.ok && row) {
                                        row.remove();
                                        if (body.rows.length === 0) {
                                            if (table) table.style.display = 'none';
                                            if (empty) empty.style.display = 'block';
                                        }
                                    } else {
                                        alert(res.error || 'Could not delete.');
                                        this.disabled = false;
                                        this.textContent = 'Delete';
                                    }
                                }.bind(this))
                                .catch(function() {
                                    alert('Request failed.');
                                    this.disabled = false;
                                    this.textContent = 'Delete';
                                }.bind(this));
                        });
                    });
                })
                .catch(function() {
                    loading.style.display = 'none';
                    if (empty) { empty.innerHTML = 'Could not load reviews. Request failed or timed out.'; empty.style.display = 'block'; }
                });
        }

        function escapeAttr(s) {
            if (s == null) return '';
            var div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML.replace(/"/g, '&quot;');
        }

        function updateDashboardDate() {
            var dateEl = document.getElementById('dashboardCurrentDate');
            if (!dateEl) return;
            dateEl.textContent = new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }).toUpperCase();
        }

        function loadAdminStats() {
            var totalUsers = document.getElementById('statTotalUsers');
            var totalGuides = document.getElementById('statTotalGuides');
            var totalDest = document.getElementById('statTotalDestinations');
            fetchWithTimeout('get_admin_stats.php', { credentials: 'same-origin' })
                .then(function(r) {
                    if (r.status === 403) return null;
                    return r.json();
                })
                .then(function(data) {
                    if (!data) return;
                    if (totalUsers) totalUsers.textContent = (data.total_users != null) ? Number(data.total_users).toLocaleString() : '—';
                    if (totalGuides) totalGuides.textContent = (data.total_guides != null) ? Number(data.total_guides).toLocaleString() : '—';
                    if (totalDest) totalDest.textContent = (data.total_destinations != null) ? Number(data.total_destinations).toLocaleString() : '—';
                })
                .catch(function() {});
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                updateDashboardDate();
                setInterval(updateDashboardDate, 60000);
                loadAdminStats();
                loadAllGuides();
                loadPending();
                loadPendingBookings();
                loadActiveGuides();
                loadSuspendedGuides();
                loadSpotsPrice();
                loadReviewsAdmin();
            });
        } else {
            updateDashboardDate();
            setInterval(updateDashboardDate, 60000);
            loadAdminStats();
            loadAllGuides();
            loadPending();
            loadPendingBookings();
            loadActiveGuides();
            loadSuspendedGuides();
            loadSpotsPrice();
            loadReviewsAdmin();
        }
    })();
    </script>
</body>
</html>
