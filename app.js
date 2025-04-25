document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("customerForm");
    if (!form) return;
  
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const photoFile = document.getElementById("photo").files[0];

      const existing = await db.collection("customers")
    .where("name", "==", name)
    .where("phone", "==", phone)
    .get();
  
  if (!existing.empty) {
    alert("This customer is already added!");
    return;
  }
  
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
  
        let photoUrl = null;
        if (photoFile) {
          const storageRef = storage.ref("photos/" + Date.now() + "-" + photoFile.name);
          await storageRef.put(photoFile);
          photoUrl = await storageRef.getDownloadURL();
        }
  
        await db.collection("customers").add({
          name,
          phone,
          location: new firebase.firestore.GeoPoint(lat, lng),
          photoUrl,
          timestamp: firebase.firestore.Timestamp.now()
        });
  
        alert("Customer submitted!");
        form.reset();
      }, (err) => {
        alert("Location Error: " + err.message);
      });
    });
  });



 
