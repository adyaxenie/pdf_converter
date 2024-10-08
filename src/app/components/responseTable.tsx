import React from 'react';

interface ResponseData {
  [key: string]: string | number | boolean; // You can adjust the types based on the expected data
}

interface TableProps {
  responseText: string | ResponseData[];
}

const ResponseTable: React.FC<TableProps> = ({ responseText }) => {
  // Parse responseText if it's a string, otherwise assume it's already an array of objects
  let parsedResponseText: ResponseData[] = [];

  if (typeof responseText === 'string') {
    try {
      parsedResponseText = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse responseText as JSON:', error);
      return <p>Error: Failed to parse responseText as JSON.</p>;
    }
  } else {
    parsedResponseText = responseText;
  }

  if (!Array.isArray(parsedResponseText) || parsedResponseText.length === 0) {
    return <p className='text-black'>No data available to display.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-auto border-collapse border border-gray-300 border-rounded text-black">
        <thead>
          <tr>
            {Object.keys(parsedResponseText[0]).map((key) => (
              <th key={key} className="border border-gray-300 px-4 py-2 text-left">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        {/* <tbody>
          {parsedResponseText.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx} className="border border-gray-300 px-4 py-2">
                  {value.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody> */}
      </table>
    </div>
  );
};

export default ResponseTable;
