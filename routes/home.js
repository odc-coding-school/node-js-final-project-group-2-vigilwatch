// Landing page route (routes/home.js)
const express = require('express');
const db = require('../model/db');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    // Fetch all incidents for the "ALL" tab
    db.all(`SELECT *, COUNT(*) as incident_count
            FROM incident_reports
            GROUP BY incident_reports.location
            ORDER BY incident_reports.id DESC`, [], (err, allIncidents) => {
        if (err) {
            console.error('Error occurred while fetching all incidents:', err);
            return res.status(500).send('Error fetching all incidents');
        }

        // Fetch detailed incidents with user information
        db.all(`SELECT incident_reports.*, auth.pseudo_name, auth.phone
                FROM incident_reports
                JOIN auth ON incident_reports.user_id = auth.user_id
                ORDER BY incident_reports.id DESC`, [], (err, detailedIncidents) => {
            if (err) {
                console.error('Error occurred while fetching detailed incidents:', err);
                return res.status(500).send('Error fetching detailed incidents');
            }

            // Process each incident in "ALL"
            allIncidents.forEach(incident => {
                // Convert profile pictures to base64 format
                if (incident.profile_picture) {
                    incident.profile_picture = incident.profile_picture.toString('base64');
                }

                // Format the time and date
                if (incident.time) {
                    const date = new Date(`1970-01-01T${incident.time}Z`); // Convert time to Date object
                    let hours = date.getUTCHours();
                    const minutes = date.getUTCMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    incident.formatted_time = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                }

                if (incident.date) {
                    const incidentDate = new Date(incident.date); // Convert to Date object
                    incident.formatted_date = incidentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                }

                // Parse and convert each image to base64 format
                if (incident.images) {
                    const imagesArray = JSON.parse(incident.images);
                    incident.imageSrcs = imagesArray.map(imageBuffer => `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`);
                }
            });

            // Process each detailed incident
            detailedIncidents.forEach(incident => {
                // Format time
                if (incident.time) {
                    const date = new Date(`1970-01-01T${incident.time}Z`); // Convert time to Date object
                    let hours = date.getUTCHours();
                    const minutes = date.getUTCMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    incident.formatted_time = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                }

                // Format date
                if (incident.date) {
                    const incidentDate = new Date(incident.date); // Convert to Date object
                    incident.formatted_date = incidentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                }

                // Parse and convert each image to base64 format
                if (incident.images) {
                    const imagesArray = JSON.parse(incident.images);
                    incident.imageSrcs = imagesArray.map(imageBuffer => `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`);
                }
            });

              // Fetch grouped incidents for specific tabs
              db.all(`SELECT incident_reports.location, incident_reports.incident_type, COUNT(*) as incident_count
              FROM incident_reports
              GROUP BY incident_reports.location, incident_reports.incident_type
              ORDER BY incident_reports.id DESC`, [], (err, groupedIncidents) => {
              if (err) {
                  console.error('Error occurred while fetching grouped incidents:', err);
                  return res.status(500).send('Error fetching grouped incidents');
              }

            const selectedMonth = req.query.month || "Jan"; // Default to January
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            // Fetch incident counts by type
            const getIncidentCounts = (callback) => {
                const query = `
                    SELECT incident_type, COUNT(*) AS count
                    FROM incident_reports
                    WHERE strftime('%Y', date) = strftime('%Y', 'now')
                    GROUP BY incident_type
                `;
                db.all(query, [], (err, rows) => {
                    if (err) {
                        console.error('Error fetching incident counts:', err);
                        return callback({});
                    }
                    const counts = {};
                    rows.forEach(row => {
                        counts[row.incident_type] = row.count;
                    });
                    callback(counts);
                });
            };
            const getMonthlyIncidents = (callback) => {
                const monthNumber = getMonthNumber(selectedMonth);
                const query = `
                    SELECT incident_type, location, COUNT(*) AS incidents_count
                    FROM incident_reports 
                    WHERE strftime('%Y', date) = strftime('%Y', 'now') 
                    AND strftime('%m', date) = ?
                    GROUP BY incident_type, location
                `;
                db.all(query, [monthNumber], (err, rows) => {
                    if (err) {
                        console.error('Error fetching monthly incident data:', err);
                        return callback({ incidentData: [], totalIncident: 0, monthlyCounts: {} });
                    }
                    
                    const incidentData = rows.map(row => ({
                        incident_type: row.incident_type,
                        location: row.location,
                        incidents_count: row.incidents_count
                    }));
            
                    // Calculate total incidents for the selected month
                    const totalIncident = incidentData.reduce((sum, incident) => sum + incident.incidents_count, 0);
            
                    // Compute monthlyCounts by incident type
                    const monthlyCounts = {};
                    incidentData.forEach(incident => {
                        if (!monthlyCounts[incident.incident_type]) {
                            monthlyCounts[incident.incident_type] = 0;
                        }
                        monthlyCounts[incident.incident_type] += incident.incidents_count;
                    });
            
                    callback({ incidentData, totalIncident, monthlyCounts });
                });
            };
            

            getIncidentCounts((counts) => {
                getMonthlyIncidents(({ incidentData, totalIncident, monthlyCounts }) => {
                    const fireCount = monthlyCounts.fire || 0;
                    const violenceCount = monthlyCounts.violence || 0;
                    const theftCount = monthlyCounts.theft || 0;
                    const vandalismCount = monthlyCounts.vandalism || 0;
                    const otherCount = monthlyCounts.other || 0;

                    const showNoDataMessage = totalIncident === 0;

                    
                    // =============== trending route ======
                    const currentDate = new Date().toISOString(); // Get current date and time

                    // Query to fetch trending incidents that have not expired
                    const sql = `SELECT incident_reports.*, auth.pseudo_name
                    FROM incident_reports
                        JOIN auth ON incident_reports.user_id = auth.user_id
                    WHERE trending = TRUE AND trending_expiry > ?`;
                
                    db.all(sql, [currentDate], (err, rows) => {
                        if (err) {
                            console.error('Error fetching trending incidents:', err);
                            return res.send('Error fetching trending incidents');
                        }
                
                        rows.forEach(incident => {
                              // Parse and convert each image to base64 format
                if (incident.images) {
                    const imagesArray = JSON.parse(incident.images);
                    incident.imageSrcs = imagesArray.map(imageBuffer => `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`);
                }
                        });
                        console.log('Fetched incidents:', rows);
                
                
                // ========================= top reporters =======================
              // ========================= top reporters =======================
              db.all(`
                SELECT users.*, auth.pseudo_name, COUNT(incident_reports.id) AS report_count
                FROM incident_reports
                JOIN auth ON incident_reports.user_id = auth.user_id
                JOIN users ON incident_reports.user_id = users.id
                GROUP BY users.id, auth.pseudo_name
                HAVING COUNT(incident_reports.id) >= 10
                ORDER BY report_count DESC
                LIMIT 10
            `, (err, topReporters) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                // Process the topReporters to get the top reporters
                const topReporter = topReporters.map(row => ({
                    id: row.id,
                    name: row.pseudo_name,
                    reportCount: row.report_count,
                    followers: row.followers
                }));
          
            

    // You can then render these top reporters on the page
    console.log(topReporter);
    // Use the topReporters list to display in your frontend


                
                    res.render('index', {
                        allIncidents, // All incidents for the "ALL" tab
                        detailedIncidents, // Detailed incidents with user information
                        groupedIncidents,
                        selectedMonth,
                        totalIncident,
                        fireCount,
                        violenceCount,
                        theftCount,
                        vandalismCount,
                        otherCount,
                        showNoDataMessage,
                        incidentData,
                        incidents: rows,
                        topReporters: topReporter,
                    });
                });
            });
        });
    });
    });
    });
    });

    function getMonthNumber(month) {
        const months = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        };
        return months[month] || "01"; // Default to January if not found
    }
});

// Route to update follower count
router.post('/update-follower-count/:reporterId', (req, res) => {
    const reporterId = req.params.reporterId;

    // Update the follower count in the database (add a follower)
    db.run(`UPDATE users SET followers = followers + 1 WHERE id = ?`, [reporterId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        // Successfully updated the follower count
        return res.status(200).json({ success: true, message: 'Follower count updated' });
    });
});

// Route to unfollow and update follower count
router.delete('/update-follower-count/:reporterId', (req, res) => {
    const reporterId = req.params.reporterId;

    // Update the follower count in the database (remove a follower)
    db.run(`UPDATE users SET followers = followers - 1 WHERE id = ?`, [reporterId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });

        }
        
        // Successfully updated the follower count
        return res.status(200).json({ success: true, message: 'Follower count decreased' });
    });
});




module.exports = router;
