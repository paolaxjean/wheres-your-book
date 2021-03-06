const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id});
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({ username, email, password});
            const token = signToken(user);
            return {token, user};
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email});

            if(!user) {
                throw new AuthenticationError('No user with this email found!');
            }
            const correctPw = await user.isCorrectPassword(password);
            if(!correctPw) {
                throw new AuthenticationError('Incorrect Password!');
            }
            const token = signToken(user);
            return { token, user};
        },
        saveBook: async ( parent, { bookId, title, description, authors, image, link}, context) => {
            if(context.user) {
                return User.findOneAndUpdate({
                    _id: context.user._id
                },
                { $addToSet: {savedBooks: {bookId, title, description, authors,image, link}},
            },
            { new: true, runValidators: true},
                
            );
            }
        },
        removeBook: async (parent, {bookId}, context) => {
            if(context.user) {
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: { savedBooks: {bookId}}},
                    {new: true}
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        }, 
    },
};

module.exports = resolvers;