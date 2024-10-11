const express = require("express");
const router = express.Router();
const db = require("../model/db");

router.get("/statistics", (req, res) => {
  if (!req.session.user) {
      return res.redirect("/");
  }

  db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, user) => {
    if (err) {
        console.error('Error occurred while fetching user data:', err);
        return res.send('Error occurred while fetching user data');
    }

    if (!user) {
        return res.send('User not found');
    }

    const base64Image = user.profile_picture ? user.profile_picture.toString('base64') : null;
    const imageSrc = base64Image ? `data:image/png;base64,${base64Image}` : '/images/profile-default.png';

  const selectedMonth = req.query.month || "Jan"; // Default to January
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Fetch incident counts by type
  const getIncidentCounts = (callback) => {
    const query = `
        SELECT incident_type, location, COUNT(*) AS count
        FROM incident_reports
        WHERE strftime('%Y', date) = strftime('%Y', 'now')
        GROUP BY incident_type, location
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching incident counts:', err);
            return callback([]);
        }
        console.log('Incident counts:', rows); // Log the counts fetched
        const counts = rows.map(row => ({
            incident_type: row.incident_type,
            location: row.location,
            count: row.count
        }));
        callback(counts);
    });
};




//   const getTrendingIncidents = (callback) => {
//     const query = `
//         SELECT incident_reports.*, users.name, users.profile_picture
//         FROM incident_reports
//         JOIN users ON users.id = incident_reports.user_id
//         WHERE date >= date('now', '-7 days')
//         ORDER BY id DESC
//         LIMIT 10 
//     `;
//     db.all(query, [], (err, rows) => {
//         if (err) {
//             console.error('Error fetching trending incidents:', err);
//             return callback([]);
//         }
//        const incidentsWithBase64Profile = rows.map(row => {
//             const base64Image = row.profile_picture ? row.profile_picture.toString('base64') : null;
//             return {
//                 ...row,
//                 profile_picture: base64Image,
//             };
//         });

//         callback(incidentsWithBase64Profile);
//     });
// };



  const getMonthlyIncidents = (callback) => {
    const monthNumber = getMonthNumber(selectedMonth);
    const query = `
        SELECT incident_type, COUNT(*) AS incidents_count
        FROM incident_reports 
        WHERE strftime('%Y', date) = strftime('%Y', 'now') 
        AND strftime('%m', date) = ?
        GROUP BY incident_type
    `;
    db.all(query, [monthNumber], (err, rows) => {
        if (err) {
            console.error('Error fetching monthly incident data:', err);
            return callback([]);
        }
        const incidentData = rows.map(row => ({
            incident_type: row.incident_type,
            incidents_count: row.incidents_count
        }));

        // Calculate total incidents for the selected month
        const totalIncident = incidentData.reduce((sum, incident) => sum + incident.incidents_count, 0);

        // Create counts for each incident type based on monthly data
        const monthlyCounts = {};
        incidentData.forEach(incident => {
            monthlyCounts[incident.incident_type] = incident.incidents_count;
        });

        // Return the incident data, total incidents, and monthly counts
        callback({ incidentData, totalIncident, monthlyCounts });
    });
};


getIncidentCounts((incidentCounts) => {
    // Prepare data for the chart
    const chartData = incidentCounts.length > 0 ? incidentCounts : [['Incident Type', 'Location', 'Count']];
    incidentCounts.forEach(row => {
        chartData.push([row.incident_type, row.location, row.count]);
    });
console.log(chartData);

      res.render("statistics", {
          selectedMonth,
          totalIncident,
          fireCount,
          violenceCount,
          theftCount,
          vandalismCount,
          otherCount,
          showNoDataMessage,
          incidentData,
          trendingIncidents, 
          userProfile: imageSrc,
          chartData: JSON.stringify(chartData),
      });
  });
});

});

// Helper function for month abbreviation to number
function getMonthNumber(month) {
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };
  return months[month] || "01"; // Default to January if not found
}

module.exports = router;
