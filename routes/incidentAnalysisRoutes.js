const express = require("express");
const router = express.Router();
const db = require("../model/db");

router.get("/analysis", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    const selectedMonth = req.query.month || 'Jan'; // Default to 'Jan' if no month is selected

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, user) => {
        if (err) {
            console.error('Error occurred while fetching user data:', err);
            return res.send('Error occurred while fetching user data');
        }

        if (!user) {
            return res.send('User not found');
        }

        const base64Image = user.profile_picture.toString('base64');
        const imageSrc = `data:image/png;base64,${base64Image}`;

        // Query to get total incidents for the selected month
        db.get(`SELECT COUNT(*) AS totalIncident FROM incident_reports WHERE strftime('%m', date) = ?`, [getMonthNumber(selectedMonth)], (err, row) => {
            if (err) {
                console.error('Error fetching total incident:', err);
                return res.status(500).send('Error fetching total incident');
            }

            const totalIncidentsCount = row.totalIncident;

            // Query to get incidents aggregated by month, sorted by date in descending order
            db.all(`SELECT strftime('%Y-%m', date) AS month, COUNT(*) AS incidents_count 
                    FROM incident_reports 
                    GROUP BY strftime('%Y-%m', date) 
                    ORDER BY strftime('%Y-%m', date) DESC`, (err, monthlyIncidents) => {
                if (err) {
                    console.error('Error fetching monthly incidents:', err);
                    return res.status(500).send('Error fetching incident data');
                }

                const incidentsForSelectedMonth = monthlyIncidents.find(incident => incident.month === `${new Date().getFullYear()}-${getMonthNumber(selectedMonth)}`);

                // Check if there are incidents for the selected month
                if (incidentsForSelectedMonth) {
                    // Slice the top 10 incidents
                    const topIncidents = monthlyIncidents.slice(0, 10);
                    
                    res.render('Analysis', { 
                        userProfile: imageSrc, 
                        totalIncident: totalIncidentsCount,
                        incidents: topIncidents,
                        selectedMonth: selectedMonth,
                        showNoDataMessage: false
                    });
                } else {
                    res.render('Analysis', { 
                        userProfile: imageSrc, 
                        totalIncident: totalIncidentsCount,
                        incidents: [], // No incidents to show
                        selectedMonth: selectedMonth,
                        showNoDataMessage: true
                    });
                }
            });
        });
    });
});

// Helper function to get month number from abbreviation
function getMonthNumber(month) {
    const months = {
        'Jan': '01',
        'Feb': '02',
        'Mar': '03',
        'Apr': '04',
        'May': '05',
        'Jun': '06',
        'Jul': '07',
        'Aug': '08',
        'Sep': '09',
        'Oct': '10',
        'Nov': '11',
        'Dec': '12'
    };
    return months[month];
}

module.exports = router;
