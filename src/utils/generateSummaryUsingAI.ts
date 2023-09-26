import axios from 'axios';

const generateSummaryUsingAI = async (content: string) => {
  const url =
    'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';

  const data = { inputs: content };
  const response = await axios.post<[{ summary_text: string }]>(url, data, {
    headers: {
      Authorization: `Bearer ${process.env['AI_API_TOKEN_HUGGING_FACE']}`,
    },
    timeout: 2 * 1000,
  });

  return response.data[0].summary_text;
};

export default generateSummaryUsingAI;
