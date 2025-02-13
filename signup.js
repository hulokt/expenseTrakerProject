  // Initialize EmailJS
  emailjs.init('ex9XUG1jbtDMPznE5'); // Replace with your EmailJS user ID

  // Set a cookie
  const setCookie = (name, value, days = 365) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  // Get a cookie
  const getCookie = name => {
      return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1] || '';
  };

  // Redirect if already signed in
  if (getCookie('isSignedIn') === 'true') {
      window.location.href = "account.html";
  }
  let userName;

  // Handle form submission
  function sendEmail() {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
    
      if (!name || !email || !phone) {
          alert("Please fill in all fields.");
          return;
      }

      const params = { name, email, phone };

      emailjs.send("service_mn8krlg", "template_5zw04oj", params)
          .then(() => {
              setCookie("isSignedIn", "true");
              userName = name;
              localStorage.setItem('userName', userName);
              window.location.href = "account.html";

              
          })
          .catch(error => {
              console.error("Error:", error);
              alert("Failed to send email. Please try again.");
          });

          

  }
