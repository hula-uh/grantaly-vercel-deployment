"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "@/components/DataTable/DataTable";
import { formatDate } from "@/helper/formateDate";
import ActionsCell from "@/components/ActionCell/ActionCell";
import toast from "react-hot-toast";
import { user } from "@/interface/interface";
import { LIMIT_COUNT } from "@/utils/constant";
import PreviewModal from "@/components/PreviewModal/PreviewModal";

interface Project {
  _id: string;
  projectTitle: string;
  abstract: string;
  fundingAgency: string;
  startDate: string;
  endDate: string;
  expectedTimeline: string;
  isCompeleted: boolean;
  formStep: number;
  isBooked: boolean;
  userId: string;
  clientDocs: any[];
  adminDocs: any[];
  dataUploadContent: any[];
  resultContent: any[];
  __v: number;
}

interface ProjectTableProps {
  isAdmin?: boolean;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ isAdmin }) => {
  
  const [APIEndPoint, setAPIEndPoint] = useState("/api/project");
  const [deleteId, setDeleteId] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPrivacy, setSelectedPrivacy] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<user[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean[]>(Array(LIMIT_COUNT).fill(false));
  const toggleModal = (idx: number) => {
    setIsModalOpen((prev) => {
      const newModalState = [...prev]; // Copy the previous state
      newModalState[idx] = !newModalState[idx]; // Toggle the modal state at the specific index
      return newModalState;
    });
  };

  const columns = [
    
    // { Header: "ID", accessor: "_id" },
    { Header: "Project Title", accessor: "projectTitle" },
    
    {
      Header: "Start Date",
      Cell: ({ row }: any) => formatDate(row.original.startDate),
    },
    {
      Header: "End Date",
      Cell: ({ row }: any) => formatDate(row.original.startDate),
    },
    {
      Header: "Estimated Timeline",
      Cell: ({ row }: any) => row.original.expectedTimeline,
    },
    {
      Header: "Data Upload Deadline",
      Cell: ({ row }: any) => row.original.dataUploadDeadline ? formatDate(row.original.dataUploadDeadline) : 'Not uploaded',
    },
    {
      Header: "Result Upload Deadline",
      Cell: ({ row }: any) => row.original.resultUploadDeadline ? formatDate(row.original.resultUploadDeadline) : 'Not uploaded',
    },
    { Header: "Documents",
      Cell: ({ row,idx }: any) => {
        const totalDocs = row.original.adminDocs.length + row.original.clientDocs.length;
        console.log(row.index,'awdjjawd')
        return (
          <div>
            {isModalOpen && <PreviewModal toggleModal={ () => {toggleModal(row.index)}} isModalOpen={isModalOpen[row.index]} clientDocs={row.original.clientDocs} adminDocs={row.original.adminDocs}/>}
          <div onClick={() => {toggleModal(row.index)}} className="relative group">
            <span className="cursor-pointer underline">
              {totalDocs}
            </span>
            {/* Tooltip */}
            <div className="flex absolute hidden group-hover:block -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Click here to view all
            </div>
          </div>
          </div>
        );
      }, 
    },
    {
      Header: "Status",
      Cell: ({ row }: any) => {
        const step = row.original.formStep
        if(step === 2 && row.original.adminDocs)
          return (<span>Please Upload Contract</span>)
        if(step === 4 && row.original.adminDocs)
          return (<span>Please upload results</span>)
        if(step <= 5 && !row.original.isCompeleted)
          return (<span>Pending</span>)
        if(step === 5 && row.original.isCompeleted)
          return 'Completed'
      }
    },
    {
      Header: "Actions",
      Cell: ({ row }: any) => (
        !row.original.isCompeleted ? 
        <ActionsCell
          viewLink={`/admin/${row.original._id}`}
          editLink={
            isAdmin
              ? `/project-initialization/edit/${row.original._id}`
              : `/project-initialization/edit/${row.original._id}`
          }
          deleteEndPoint={`/project`}
          setDeleteId={setDeleteId}
          deleteId={row.original._id}
        /> : null
      ),
    },
  ];

  const handleApply = () => {
    setIsApplied(true);
    setRefresh((prev) => !prev);
    setAPIEndPoint(`/api/user/${selectedUser}`);
  };

  const handleReset = () => {
    setRefresh((prev) => !prev);
    setIsApplied(false);
    setAPIEndPoint(`/api/project`);
    setSelectedPrivacy("");
    setSelectedUser("");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/user");
        const fetchUsers = response.data
        setUsers(fetchUsers ?? []);
      } catch (error) {
        toast.error('Error in fetching users')
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex pt-5 items-center justify-between">
          <h2 className="text-lg font-bold py-2 text-black">Projects</h2>
          <div className="flex items-center gap-2">
            {/* <div className="bg-white rounded-lg w-96">
              <select
                className="w-full p-2 border rounded"
                placeholder="Select User"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {users.map((user)=> (
                  <option key={user._id} value={user._id}>
                    {user.firstName + " " + user.lastName}
                  </option>
                ))}
              </select>
            </div>
            {(selectedUser || selectedPrivacy) && (
              <button
                className="px-4 py-2 text-black bg-purple-500 rounded"
                onClick={handleApply}
              >
                Apply
              </button>
            )}
            {isApplied && (
              <button
                className="px-4 py-2 text-black bg-purple-500 rounded"
                onClick={handleReset}
              >
                Reset
              </button>
            )} */}
          </div>
        </div>
        <DataTable
          columns={columns}
          APIEndPoint={APIEndPoint}
          refresh={refresh}
          filterId={deleteId}
        />
      </div>
    </div>
  );
  
};

export default ProjectTable;
