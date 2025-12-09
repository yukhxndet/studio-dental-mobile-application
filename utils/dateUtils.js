// Function to format date to Thai
export const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    // Options for formatting the date
    const options = {
      weekday: 'long', // Monday
      day: 'numeric', // 29
      month: 'long', // July
      year: 'numeric' // 2024
    };
  
    const formattedDate = new Intl.DateTimeFormat('th-TH', options).format(date);
    return formattedDate;
  };
  
  // Function to format time to Thai time (UTC+7)
  export const formatTime = (dateString) => {
    const date = new Date(dateString);
  
    // Adjust time to UTC+7
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const thaiHours = (utcHours + 7) % 24; // Adjust for timezone
  
    return `${thaiHours}:${utcMinutes < 10 ? '0' : ''}${utcMinutes}`;
  };
  