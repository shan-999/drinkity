const userModel = require('../../model/userModel')


const loadusers = async (req,res) => {
    try {
        const adminId = req.session.adminId
        if(!adminId) return res.redirect('/admin/login?message=sumthing errore')

        const users = await userModel.find({})
        res.render('admin/users',{users:users})
    } catch (error) {
        if(error) console.log(`Error from loadUser : ${error}`);
    }
}


// const userStatus = async(req,res) => {
//     const {userId} = req.body
//     const action = req.params.action


//     try {
//         const user = await userModel.findById(userId);
//         if (!user) return res.json({ success: false, message: 'User not found' });
    
//         if (action === 'block') {
//           user.isBlocked = true;
//           req.session.userId = null
//         } else if (action === 'unblock') {
//           user.isBlocked = false;
//           req.session.userId = userId
//         }
    
//         await user.save();
//         return res.json({ success: true });
//       } catch (error) {
//         console.error(error);
//         res.json({ success: false, message: 'Error occurred' });
//       }
// }


const userStatus = async (req, res) => {
  const { userId } = req.body;
  const { action } = req.params;
  console.log(`Received request: ${userId}, Action: ${action}`);
  try {
      const user = await userModel.findById(userId);
      if (!user) return res.json({ success: false, message: 'User not found' });

      if (action === 'block') {
          user.isBlocked = true;
          req.session.userId = null;
      } else if (action === 'unblock') {
          user.isBlocked = false;
          req.session.userId = userId;
      } else {
          return res.json({ success: false, message: 'Invalid action' });
      }

      await user.save();
      res.json({ success: true, message: `User ${action}ed successfully.` });
  } catch (error) {
      console.error('Error in changing user status:', error);
      res.json({ success: false, message: 'Error occurred while updating user status.' });
  }
};




module.exports = {
    loadusers,
    userStatus
}