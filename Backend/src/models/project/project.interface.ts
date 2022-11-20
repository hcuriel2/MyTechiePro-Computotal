import Comment from "./comment.interface";
interface Project {
    [index: number]: Comment;
    serviceName: string;
    serviceId:string;
    client:object;
    professional:object;
    totalCost: number;
    projectDetails:string;
    projectStartDate:Date;
    projectEndDate:Date;
    eTransferEmail:string;
    state: string;
    rating: number;
    feedback: string;
    isPaid: boolean;
}

export default Project;
