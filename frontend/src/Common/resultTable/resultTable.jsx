const ResultTable = ({ data }) => {
    if (!data) return null;
  
    return (
      <div style={{ margin: '20px 0' }}>
        <h2>{data.questionType}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {data.headers.map((header, idx) => (
                <th key={idx} style={{ border: '1px solid #ccc', padding: '10px', background: '#f5f5f5' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={{ border: '1px solid #ccc', padding: '10px' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {data.overallScore && (
              <tr>
                <td colSpan={data.headers.length} style={{ textAlign: 'right', fontWeight: 'bold', padding: '10px', borderTop: '2px solid #000' }}>
                  Overall Score: {data.overallScore}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  

  export default ResultTable;