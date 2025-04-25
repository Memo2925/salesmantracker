async function loadCustomers() {
    const tbody = document.querySelector('#customer-table tbody');
    tbody.innerHTML = "";

    
  
    try {
      const snapshot = await db.collection("customers").orderBy("timestamp", "desc").get();
      const seen = new Set();
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const key = data.name + data.phone;
        if (seen.has(key)) continue;
        seen.add(key);
      }
  
      snapshot.forEach(async (doc) => {
        const data = doc.data();
        const row = document.createElement('tr');
  
        const time = data.timestamp?.toDate().toLocaleString() || "-";
        const lat = data.location?.latitude || 0;
        const lng = data.location?.longitude || 0;
  
        let locality = "Unknown";
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                headers: {
                  "Accept": "application/json",
                  "User-Agent": "YourAppName/1.0 (your@email.com)"
                }
              });
              const json = await res.json();
              console.log("Geocoder result:", json); // ✅ Check what's inside
              let locality = "Unknown";
                if (json.address) {
                    locality = json.address.county || json.address.city || json.address.town || json.address.village || json.address.suburb || json.address.hamlet || json.display_name || "Unknown";
                }
                console.log(json.address);

                row.innerHTML = `
                 <td>${data.name}</td>
                <td>${data.phone}</td>
                <td>${time}</td>
                <td>${locality}</td>
                `;
        } catch (err) {
          console.warn("Reverse geocoding failed:", err);
          row.innerHTML = `
    <td>${data.name}</td>
    <td>${data.phone}</td>
    <td>${time}</td>
    <td>Unknown</td>
  `;
        }
  
       
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  }
  
  let mapInstance = null;

  function showTab(tabId) {
   

    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'map' && mapInstance) {
        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 100); // slight delay helps ensure it's visible
      }
  }
  
  window.addEventListener("DOMContentLoaded", loadCustomers);

  db.collection("customers").get().then(snapshot => {
    console.log("Docs count:", snapshot.size);
    snapshot.forEach(doc => console.log(doc.id, doc.data()));
  });

  function downloadCSV() {
    const rows = [["Name", "Phone", "Timestamp", "Locality"]];
    document.querySelectorAll("#customer-table tbody tr").forEach(tr => {
      const cols = Array.from(tr.children).map(td => `"${td.innerText}"`);
      rows.push(cols);
    });

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
  }





  async function loadSalesmanStats() {
    const snapshot = await db.collection("customers").orderBy("timestamp", "desc").get();
    const allDocs = snapshot.docs;
  
    if (allDocs.length === 0) return;
  
  
  
    // Total houses = total documents
    document.getElementById("total-houses").textContent = allDocs.length;
  
    // Calculate today's entries
    const now = new Date();
    const todayDocs = allDocs.filter(doc => {
      const ts = doc.data().timestamp?.toDate();
      return ts && ts.toDateString() === now.toDateString();
    });
  
    document.getElementById("today-houses").textContent = todayDocs.length;
  
    // Calculate online time today (first to last entry)
    if (todayDocs.length >= 2) {
      const first = todayDocs[todayDocs.length - 1].data().timestamp.toDate();
      const last = todayDocs[0].data().timestamp.toDate();
      const diff = Math.abs(last - first);
      const hours = (diff / (1000 * 60 * 60)).toFixed(2);
      document.getElementById("online-hours").textContent = `${hours} hrs`;
    } else {
      document.getElementById("online-hours").textContent = "N/A";
    }
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    loadSalesmanStats();
  });

  async function loadSalesmanProfile() {
    const doc = await db.collection("salesmanProfile").doc("main").get();
    if (doc.exists) {
      const data = doc.data();
      document.getElementById("salesman-name").textContent = data.name;
      document.getElementById("salesman-phone").textContent = data.phone;
      document.getElementById("salesman-name-input").value = data.name;
      document.getElementById("salesman-phone-input").value = data.phone;
    }
  }
  
  document.getElementById("edit-salesman-btn").addEventListener("click", () => {
    document.getElementById("salesman-name").style.display = "none";
    document.getElementById("salesman-phone").style.display = "none";
    document.getElementById("salesman-name-input").style.display = "inline-block";
    document.getElementById("salesman-phone-input").style.display = "inline-block";
    document.getElementById("edit-salesman-btn").style.display = "none";
    document.getElementById("save-salesman-btn").style.display = "inline-block";
  });
  
  document.getElementById("save-salesman-btn").addEventListener("click", async () => {
    const name = document.getElementById("salesman-name-input").value;
    const phone = document.getElementById("salesman-phone-input").value;
  
    await db.collection("salesmanProfile").doc("main").set({ name, phone });
  
    document.getElementById("salesman-name").textContent = name;
    document.getElementById("salesman-phone").textContent = phone;
  
    document.getElementById("salesman-name").style.display = "inline";
    document.getElementById("salesman-phone").style.display = "inline";
    document.getElementById("salesman-name-input").style.display = "none";
    document.getElementById("salesman-phone-input").style.display = "none";
    document.getElementById("edit-salesman-btn").style.display = "inline-block";
    document.getElementById("save-salesman-btn").style.display = "none";
  
    alert("Salesman details updated!");
  });
  
  // Call this after DOM loads
  window.addEventListener("DOMContentLoaded", () => {
    loadSalesmanProfile();
  });