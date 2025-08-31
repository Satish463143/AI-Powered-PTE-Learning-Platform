const { mockStatus } = require("../../config/constant.config");
const fullMockTestService = require("./fullMockTest.service");
const FullMockTest = require("./fullMockTest.model");

class FullMockTestController {

    mockkTest;
    
    createMockTest = async(req,res,next)=>{
        try{
            const userId= req.authUser;
            const {
                actionType, // next || submit || generate_question || generate_all_questions
                question,   // full question object (not required for generate_all_questions)
                userAnswer, // user's answer
                mockTestId  // optional - will be created if not provided
              } = req.body;
              
            const response = await fullMockTestService.handleFullMockTest(
                userId,
                actionType,
                question,
                userAnswer,
                mockTestId
            )

            res.json({
                message:"Operation completed successfully",
                result: response,
                meta:null
            })

        }catch(exception){
            console.log(exception);
            next(exception);
        }
    }

    #validate = async(id)=>{
        try{
            if(!id){
                throw { status:400, message:"Mock test id is required"}
            }
            const mockTest = await fullMockTestService.getMockTestById(id);

            return mockTest;

        }catch(exception){
            throw exception;
        }
    }
    
    getMockTestReport = async(req,res,next)=>{
        try{
            let filter = {userId:req.authUser};
            const response = await fullMockTestService.getAllMockTest(filter);

            res.json({
                message: response.message || "All Mock test list retrieved successfully",
                result: response.data,
                meta:{
                    total: response.count,
                }
            })

        }catch(exception){
            console.log(exception);
            next(exception);
        }
    }
    
    getMockTestReportById = async(req,res,next)=>{
        try{
            const id = req.params.id;
            const mockTest = await this.#validate(id);           
           
            res.json({
                message:"Mock test details retrieved successfully",
                result: mockTest,
                meta:null
            })

        }catch(exception){
            console.log(exception);
            next(exception);
        }
    }
    
    getMockTestStats = async(req,res,next)=>{
        try{
            let userId = req.authUser;
            let filter = {
                userId,
                status: mockStatus.COMPLETED,
            };
            const {count , data} = await fullMockTestService.getUserMockTests(filter);

            res.json({
                message:"Mock test statistics retrieved successfully",
                result: data,
                meta:{
                    total: count,
                }
            })

        }catch(exception){
            console.log(exception);
            next(exception);
        }
    }

    // Save About Me recording
    saveAboutMe = async (req, res) => {
        try {
            const userId = req.authUser;
            const { file } = req;
            if (!file) {
                return res.status(400).json({ message: "No audio file provided" });
            }

            // Create a new mock test with about me recording
            const mockTest = await fullMockTestService.saveAboutMe(userId, file);


            res.status(201).json({
                result: mockTest,
                message: "About Me recording saved successfully",
                meta:null
            });
        } catch (exception) {
            console.error("Error saving About Me recording:", exception);
            next(exception)
        }
    };

}

module.exports = new FullMockTestController();