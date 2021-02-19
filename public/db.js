let db;

// Create a new db request for a `budget` database.
const request = window.indexedDB.open("budget", 1);

// * Inside `onupgradeneeded`, create an object store called `pending` and set `autoIncrement` to `true`.
request.onupgradeneeded = ({ target }) => {
    db = target.result;
    const objectStore = db.createObjectStore("pending", { autoIncrement: true });
}

request.onerror = event => {
    console.log("There was an error: " + event.target.errorCode);
}

request.onsuccess = () => {
    db = request.result;
    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
}
// * Inside your `saveRecord()` function:
const saveRecord = (record) => {
    // Create a transaction on the `pending` object store with `readwrite` access.
    const transaction = db.transaction(["pending"], "readwrite");

    // Access your pending object store.
    const objectStore = transaction.objectStore("pending");

    // Add a record to your store with the `add` method.
    objectStore.add(record)

}


// Inside the `checkDatabase` function:
const checkDatabase = () => {
    // Open a transaction on your `pending` object store.
    const transaction = db.transaction(["pending"], "readwrite");

    // Access your `pending` object store.
    const store = transaction.objectStore("pending");

    // Get all records from store and set to a variable.
    const getAll = store.getAll();

    //Inside `getAll.onsuccess`:
    getAll.onsuccess = () => {
        if (getAll.result.lenght > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // If successful, open a transaction on your `pending` object store.
                    const transaction = db.transaction(["pending"], "readwrite");

                    // Access your `pending` object store.
                    const store = transaction.objectStore("pending");

                    // Clear all items in your store.
                    store.clear();

                })
        }
    }
}

window.addEventListener("online", checkDatabase);


