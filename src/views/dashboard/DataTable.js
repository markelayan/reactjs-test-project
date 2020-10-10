import React from "react";

function DataTable(props) {
  let fields = props.fields;
  let productElements = props.items;

  return (
    <div className="table-responsive">
      <table id="productsTable" className="table">
        <thead>
          <tr>
            {fields.map((field, i) => (
              <th key={i} scope="col">
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productElements.length != 0 ? (
            productElements.map((el, i) => {
              return (
                <tr id={el.placeID} key={i}>
                  <td>{el.date}</td>
                  <td>{el.productName}</td>
                  <td>{el.placeName}</td>
                  <td>{el.currentUnitCount}</td>
                  <td>{el.lineCost}</td>
                  <td className="removeBtn">
                    <span
                      id={el.placeID}
                      onClick={props.click.bind(null, i, el.placeID)}
                    >
                      {el.remove}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td>No Data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
