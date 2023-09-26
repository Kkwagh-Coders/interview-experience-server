import generateSummaryUsingAI from './generateSummaryUsingAI';
import generateTextFromHTML from './generateTextFromHTML';

const generateSummaryFromHTMLContent = async (htmlContent: string) => {
  try {
    const summary = await generateSummaryUsingAI(htmlContent);
    return summary;
  } catch (error) {
    console.log('Failed to generate summary');
    return generateTextFromHTML(htmlContent);
  }
};

export default generateSummaryFromHTMLContent;
