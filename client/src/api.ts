export const editSurvey = async (id: string, surveyData: any) => {
  try {
    const response = await axios.put(`${API_URL}/surveys/${id}`, surveyData);
    console.log('✅ Survey edited successfully:', response);
    return response.data.data; // Return the complete survey data, not just the ID
  } catch (error) {
    console.error('❌ Error editing survey:', error);
    throw error;
  }
}; 