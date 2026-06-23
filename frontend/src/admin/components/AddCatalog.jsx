import React, { useCallback, useState } from "react";
import ProducutsForm from "./ProducutsForm";
import { useDispatch, useSelector } from "react-redux";
import { createNewCatalog } from "../../store/slices/appSlice";

const AddCatalog = () => {
  const dispatch = useDispatch();

  const handleAddCatalog = useCallback(async (catalogData, userId )=>{
      try {
        const response = await dispatch(createNewCatalog({catalogData, userId })).unwrap();
        return response 
      } catch (error) {
        return error
      }
  } , [dispatch])



  return (
    <div>
      <ProducutsForm
        isEdit={false}
        AddCatalogs={handleAddCatalog}
      />
    </div>
  );
};

export default AddCatalog;
