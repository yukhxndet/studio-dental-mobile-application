const formatDateToThai = (date) => {
    try {
      
      const options = {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', locale: 'th' };
      const formattedDate = new Date(date).toLocaleDateString('th-TH', options);
      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  export default formatDateToThai;
  